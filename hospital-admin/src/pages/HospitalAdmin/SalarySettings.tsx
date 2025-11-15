import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import AppShell from '../../components/layout/AppShell';
import { HospitalAPI, BillingData } from '../../api/endpoints';
import { useAuth } from '../../store/auth';
import Spinner from '../../components/feedback/Spinner';
import TextField from '../../components/forms/TextField';
import Select from '../../components/forms/Select';

type TaxType = {
  id: string;
  name: string;
  percentage: number;
};

const SalarySettings = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const hospitalId = user?.hospital_id || '1';
  const queryClient = useQueryClient();

  // Fetch payroll data to get employee info
  const { data: billingData, isLoading } = useQuery<BillingData>({
    queryKey: ['hospital', 'billings', hospitalId, 'payroll'],
    queryFn: async () => {
      return await HospitalAPI.getBillings(hospitalId, 'payroll');
    },
  });

  const employee = billingData?.payroll?.find(emp => emp.id === Number(employeeId));

  // Load salary structure from localStorage
  const [baseSalary, setBaseSalary] = useState<string>('');
  const [taxTypes, setTaxTypes] = useState<TaxType[]>([]);

  // Default tax types
  const defaultTaxTypes = [
    { id: 'vat', name: 'VAT', percentage: 0 },
    { id: 'income-tax', name: 'Income Tax', percentage: 0 },
    { id: 'social-security', name: 'Social Security', percentage: 0 },
    { id: 'medicare', name: 'Medicare', percentage: 0 },
  ];

  useEffect(() => {
    if (employee) {
      // Load existing salary structure from localStorage
      const stored = localStorage.getItem(`hospital-admin-salary-${employeeId}`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setBaseSalary(data.baseSalary?.toString() || employee.salary.toString());
          setTaxTypes(data.taxTypes || defaultTaxTypes);
        } catch (err) {
          console.error('Error loading salary structure:', err);
          setBaseSalary(employee.salary.toString());
          setTaxTypes(defaultTaxTypes);
        }
      } else {
        setBaseSalary(employee.salary.toString());
        setTaxTypes(defaultTaxTypes);
      }
    }
  }, [employee, employeeId]);

  // Calculate net salary - recalculates when baseSalary or taxTypes change
  // MUST be before any conditional returns to comply with Rules of Hooks
  const netSalary = useMemo(() => {
    if (!baseSalary) return 0;
    const base = parseFloat(baseSalary);
    if (isNaN(base)) return 0;
    const totalDeductions = taxTypes.reduce((sum, tax) => {
      return sum + (base * (tax.percentage || 0) / 100);
    }, 0);
    return Math.max(0, base - totalDeductions); // Ensure net salary is not negative
  }, [baseSalary, taxTypes]);

  // Save salary structure mutation
  const saveSalaryMutation = useMutation({
    mutationFn: async (data: { baseSalary: number; taxTypes: TaxType[]; netSalary: number }) => {
      // Save to localStorage (mock DB)
      const salaryData = {
        ...data,
        employeeId: Number(employeeId),
        employeeName: employee?.name || '',
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(`hospital-admin-salary-${employeeId}`, JSON.stringify(salaryData));
      
      // Also update the payroll data in the billing query cache
      queryClient.setQueryData(['hospital', 'billings', hospitalId, 'payroll'], (oldData: BillingData | undefined) => {
        if (!oldData?.payroll) return oldData;
        return {
          ...oldData,
          payroll: oldData.payroll.map(emp => 
            emp.id === Number(employeeId) 
              ? { ...emp, salary: data.baseSalary }
              : emp
          ),
        };
      });
      
      return { ok: true };
    },
    onSuccess: async () => {
      // Invalidate payroll query to refresh data
      await queryClient.invalidateQueries({ queryKey: ['hospital', 'billings', hospitalId, 'payroll'] });
      // Also invalidate employment financial query
      await queryClient.invalidateQueries({ queryKey: ['hospital', 'staff', 'employment-financial', hospitalId, employeeId] });
      toast.success('Salary structure saved successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save salary structure');
    },
  });

  const handleSave = () => {
    if (!baseSalary || parseFloat(baseSalary) <= 0) {
      toast.error('Please enter a valid base salary');
      return;
    }

    // Validate all tax percentages
    const activeTaxes = taxTypes.filter(tax => tax.percentage > 0);
    
    // Validate percentage range for active taxes
    const invalidTax = activeTaxes.find(tax => tax.percentage < 5 || tax.percentage > 15);
    if (invalidTax) {
      toast.error(`${invalidTax.name} percentage must be between 5% and 15%`);
      return;
    }
    
    // Enforce 2-3 taxes (as per user request)
    if (activeTaxes.length < 2) {
      toast.error('Please select at least 2 tax types');
      return;
    }
    
    if (activeTaxes.length > 3) {
      toast.error('Please select a maximum of 3 tax types');
      return;
    }

    // Use current taxTypes (they're updated in real-time via onChange)
    const updatedTaxTypes = [...taxTypes];

    // Calculate net salary using current taxTypes
    const baseSalaryValue = parseFloat(baseSalary);
    const totalDeductions = updatedTaxTypes.reduce((sum, tax) => {
      return sum + (baseSalaryValue * (tax.percentage || 0) / 100);
    }, 0);
    const netSalaryValue = Math.max(0, baseSalaryValue - totalDeductions); // Ensure net salary is not negative

    saveSalaryMutation.mutate({
      baseSalary: baseSalaryValue,
      taxTypes: updatedTaxTypes,
      netSalary: netSalaryValue,
    });
  };

  const handleAddTaxType = () => {
    const newTaxName = prompt('Enter tax type name:');
    if (newTaxName && newTaxName.trim()) {
      const newTax: TaxType = {
        id: `custom-${Date.now()}`,
        name: newTaxName.trim(),
        percentage: 0,
      };
      setTaxTypes([...taxTypes, newTax]);
    }
  };


  const handleUpdateTaxPercentage = (taxId: string, percentage: string) => {
    const value = parseFloat(percentage);
    if (percentage === '' || (!isNaN(value) && value >= 5 && value <= 15)) {
      setTaxTypes(prev => prev.map(tax => 
        tax.id === taxId 
          ? { ...tax, percentage: percentage === '' ? 0 : value }
          : tax
      ));
    }
  };

  const handleRemoveTax = (taxId: string) => {
    setTaxTypes(prev => prev.filter(tax => tax.id !== taxId));
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </AppShell>
    );
  }

  if (!employee) {
    return (
      <AppShell>
        <div className="max-w-7xl mx-auto">
          <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-8 text-center">
            <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-2">
              Employee not found
            </h2>
            <button
              onClick={() => navigate('/hospital/billings?tab=payroll')}
              className="text-primary hover:text-primary/80 font-medium underline mt-4"
            >
              ← Back to Payroll
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
            <button
              onClick={() => navigate('/hospital/billings')}
              className="text-primary hover:text-primary/80 font-medium mb-4 inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back to Payroll
            </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground-light dark:text-foreground-dark mb-2">
            Salary Structure - {employee.name}
          </h1>
          <p className="text-subtle-light dark:text-subtle-dark">
            Configure base salary and tax deductions for {employee.name}
          </p>
        </div>

        {/* Salary Configuration Card */}
        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-6 space-y-6">
          {/* Base Salary */}
          <div>
            <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
              Base Salary (Monthly)
            </label>
            <TextField
              type="number"
              step="0.01"
              value={baseSalary}
              onChange={(e) => setBaseSalary(e.target.value)}
              placeholder="Enter base salary"
              className="h-12"
            />
          </div>

          {/* Tax Types Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark">
                Tax Deductions <span className="text-subtle-light dark:text-subtle-dark font-normal">(Select 2-3 taxes required)</span>
              </label>
              <button
                onClick={handleAddTaxType}
                className="h-9 px-4 rounded-lg font-medium bg-primary text-white text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Create Tax Type
              </button>
            </div>

            {/* Tax Types List with Checkboxes and Percentage Inputs */}
            {taxTypes.length > 0 && (
              <div className="space-y-3">
                {taxTypes.map((tax) => (
                  <div
                    key={tax.id}
                    className="p-4 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark"
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox to enable/disable tax */}
                      <div className="flex items-center pt-2">
                        <input
                          type="checkbox"
                          id={`tax-${tax.id}`}
                          checked={tax.percentage > 0}
                          onChange={() => {
                            if (tax.percentage > 0) {
                              // Disable: set percentage to 0
                              handleUpdateTaxPercentage(tax.id, '0');
                            } else {
                              // Enable: set a default percentage (user can change)
                              handleUpdateTaxPercentage(tax.id, '5');
                            }
                          }}
                          className="w-5 h-5 rounded border-border-light dark:border-border-dark text-primary focus:ring-primary focus:ring-2"
                        />
                      </div>

                      {/* Tax Name and Percentage Input */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label 
                            htmlFor={`tax-${tax.id}`}
                            className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2 cursor-pointer"
                          >
                            {tax.name}
                          </label>
                          {tax.percentage > 0 && (
                            <div className="flex items-center gap-2">
                              <TextField
                                type="number"
                                step="0.01"
                                min="5"
                                max="15"
                                value={tax.percentage > 0 ? tax.percentage.toString() : ''}
                                onChange={(e) => handleUpdateTaxPercentage(tax.id, e.target.value)}
                                placeholder="5-15%"
                                className="h-10 flex-1"
                              />
                              <span className="text-sm text-subtle-light dark:text-subtle-dark whitespace-nowrap">%</span>
                            </div>
                          )}
                          {tax.percentage === 0 && (
                            <p className="text-xs text-subtle-light dark:text-subtle-dark">
                              Check to enable this tax
                            </p>
                          )}
                        </div>

                        {/* Deduction Amount Display */}
                        {tax.percentage > 0 && baseSalary && (
                          <div className="flex items-end">
                            <div className="w-full">
                              <label className="block text-xs text-subtle-light dark:text-subtle-dark mb-1">
                                Deduction Amount
                              </label>
                              <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                                -{((parseFloat(baseSalary) * tax.percentage) / 100).toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: 'USD',
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Remove Button (only for custom taxes) */}
                        {tax.id.startsWith('custom-') && (
                          <div className="flex items-end sm:col-span-2">
                            <button
                              onClick={() => handleRemoveTax(tax.id)}
                              className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {taxTypes.length === 0 && (
              <div className="text-center py-8 text-subtle-light dark:text-subtle-dark">
                <p>No tax types available. Click "Create Tax Type" to add one.</p>
              </div>
            )}

            {/* Info Message */}
            {taxTypes.filter(t => t.percentage > 0).length > 0 && (
              <div className={`mt-4 p-3 rounded-lg border ${
                taxTypes.filter(t => t.percentage > 0).length >= 2 && taxTypes.filter(t => t.percentage > 0).length <= 3
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
              }`}>
                <p className={`text-sm ${
                  taxTypes.filter(t => t.percentage > 0).length >= 2 && taxTypes.filter(t => t.percentage > 0).length <= 3
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-yellow-700 dark:text-yellow-300'
                }`}>
                  <span className="font-semibold">Selected:</span> {taxTypes.filter(t => t.percentage > 0).length} tax{taxTypes.filter(t => t.percentage > 0).length !== 1 ? 'es' : ''} 
                  ({taxTypes.filter(t => t.percentage > 0).map(t => `${t.name} (${t.percentage}%)`).join(', ')})
                  {taxTypes.filter(t => t.percentage > 0).length < 2 && (
                    <span className="block mt-1">⚠️ Please select at least 2 tax types</span>
                  )}
                  {taxTypes.filter(t => t.percentage > 0).length > 3 && (
                    <span className="block mt-1">⚠️ Please select a maximum of 3 tax types</span>
                  )}
                </p>
              </div>
            )}
            {taxTypes.filter(t => t.percentage > 0).length === 0 && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  ⚠️ Please select 2-3 tax types to proceed. Check the boxes above to enable taxes and set their percentages.
                </p>
              </div>
            )}
          </div>

          {/* Salary Summary */}
          {baseSalary && (
            <div className="border-t border-border-light dark:border-border-dark pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-subtle-light dark:text-subtle-dark">Base Salary:</span>
                  <span className="font-medium text-foreground-light dark:text-foreground-dark">
                    {parseFloat(baseSalary).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </span>
                </div>
                {taxTypes.filter(tax => tax.percentage > 0).length > 0 ? (
                  taxTypes.filter(tax => tax.percentage > 0).map((tax) => (
                    <div key={tax.id} className="flex justify-between text-sm">
                      <span className="text-subtle-light dark:text-subtle-dark">
                        {tax.name} ({tax.percentage}%):
                      </span>
                      <span className="font-medium text-red-600 dark:text-red-400">
                        -{((parseFloat(baseSalary) * tax.percentage) / 100).toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-subtle-light dark:text-subtle-dark italic py-2">
                    No taxes selected
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border-light dark:border-border-dark">
                  <span className="text-foreground-light dark:text-foreground-dark">Net Salary:</span>
                  <span className="text-primary">
                    {netSalary > 0 
                      ? netSalary.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : '$0.00'
                    }
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => navigate('/hospital/billings')}
              className="h-11 px-6 rounded-lg font-semibold bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saveSalaryMutation.isPending}
              className="h-11 px-6 rounded-lg font-semibold bg-primary text-white shadow-soft hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saveSalaryMutation.isPending ? 'Saving...' : 'Save Salary Structure'}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default SalarySettings;

