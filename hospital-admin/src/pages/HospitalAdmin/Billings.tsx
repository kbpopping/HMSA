import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import clsx from 'clsx';
import AppShell from '../../components/layout/AppShell';
import { HospitalAPI, BillingData } from '../../api/endpoints';
import { useAuth } from '../../store/auth';
import Spinner from '../../components/feedback/Spinner';
import EmptyState from '../../components/feedback/EmptyState';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DataTable from '../../components/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import Select from '../../components/forms/Select';
import TextField from '../../components/forms/TextField';
import DateTimePicker from '../../components/forms/DateTimePicker';
import Modal from '../../components/modals/Modal';

type TabType = 'overview' | 'accounts-payable' | 'accounts-receivable' | 'payroll' | 'financial-reports' | 'taxes';
type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly';

/**
 * Billings Page
 * 
 * Financial management page with multiple tabs:
 * - Overview: KPIs, revenue chart, top contributors
 * - Accounts Payable: Bills and expenses
 * - Accounts Receivable: Outstanding payments
 * - Payroll & Salaries: Staff compensation
 * - Financial Reports: Export reports
 * - Taxes: Tax information
 */
const Billings = () => {
  const { user } = useAuth();
  const hospitalId = user?.hospital_id || '1';
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [revenuePeriod, setRevenuePeriod] = useState<PeriodType>('monthly');
  
  // Accounts Payable filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [isAddBillModalOpen, setIsAddBillModalOpen] = useState(false);
  const [billFormData, setBillFormData] = useState({
    vendor: '',
    description: '',
    amount: '',
    category: '',
    due_date: '',
  });

  // Accounts Receivable filters
  const [arSearchQuery, setArSearchQuery] = useState('');
  const [arStatusFilter, setArStatusFilter] = useState<string>('all');
  const [arServiceFilter, setArServiceFilter] = useState<string>('all');
  const [arDateFilter, setArDateFilter] = useState<string>('');
  const [isAddReceivableModalOpen, setIsAddReceivableModalOpen] = useState(false);
  const [receivableFormData, setReceivableFormData] = useState({
    patient_name: '',
    invoice_number: '',
    service_rendered: '',
    amount_due: '',
    due_date: '',
  });

  // Financial Reports - Individual report states
  const [revenueStartDate, setRevenueStartDate] = useState<string>('');
  const [revenueEndDate, setRevenueEndDate] = useState<string>('');
  const [expenseStartDate, setExpenseStartDate] = useState<string>('');
  const [expenseEndDate, setExpenseEndDate] = useState<string>('');
  const [payrollStartDate, setPayrollStartDate] = useState<string>('');
  const [payrollEndDate, setPayrollEndDate] = useState<string>('');
  const [taxStartDate, setTaxStartDate] = useState<string>('');
  const [taxEndDate, setTaxEndDate] = useState<string>('');
  const [arAgingPeriod, setArAgingPeriod] = useState<string>('');
  const [apAgingPeriod, setApAgingPeriod] = useState<string>('');

  // Tax management states
  const [isTaxDetailsModalOpen, setIsTaxDetailsModalOpen] = useState(false);
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [isAddTaxModalOpen, setIsAddTaxModalOpen] = useState(false);
  const [selectedTax, setSelectedTax] = useState<{ type: string; amount: number } | null>(null);
  const [taxPaymentFormData, setTaxPaymentFormData] = useState({
    paymentDate: '',
    amount: '',
    notes: '',
  });
  const [newTaxFormData, setNewTaxFormData] = useState({
    name: '',
    purpose: '',
    amount: '',
    paymentFrequency: 'annual',
    dueDate: '',
  });

  // Load taxes from localStorage
  const loadTaxes = (): { incomeTax: number; payrollTax: number; propertyTax: number; [key: string]: number } => {
    try {
      const stored = localStorage.getItem('hospital-admin-taxes');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.error('Error loading taxes from localStorage:', err);
    }
    return { incomeTax: 125000, payrollTax: 45000, propertyTax: 30000 };
  };

  // Load tax payments from localStorage
  const loadTaxPayments = (): Array<{
    id: string;
    taxType: string;
    amount: number;
    paymentDate: string;
    status: 'paid' | 'pending';
    notes?: string;
  }> => {
    try {
      const stored = localStorage.getItem('hospital-admin-tax-payments');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.error('Error loading tax payments from localStorage:', err);
    }
    // Default payment history
    return [
      {
        id: '1',
        taxType: 'Income Tax',
        amount: 125000,
        paymentDate: new Date(new Date().getFullYear(), 3, 10).toISOString(),
        status: 'paid' as const,
      },
      {
        id: '2',
        taxType: 'Payroll Tax',
        amount: 45000,
        paymentDate: new Date(new Date().getFullYear(), 0, 15).toISOString(),
        status: 'paid' as const,
      },
      {
        id: '3',
        taxType: 'Property Tax',
        amount: 30000,
        paymentDate: new Date(new Date().getFullYear() - 1, 0, 31).toISOString(),
        status: 'paid' as const,
      },
    ];
  };

  // Save taxes to localStorage
  const saveTaxes = (taxes: { incomeTax: number; payrollTax: number; propertyTax: number; [key: string]: number }) => {
    try {
      localStorage.setItem('hospital-admin-taxes', JSON.stringify(taxes));
    } catch (err) {
      console.error('Error saving taxes to localStorage:', err);
    }
  };

  // Save tax payments to localStorage
  const saveTaxPayments = (payments: ReturnType<typeof loadTaxPayments>) => {
    try {
      localStorage.setItem('hospital-admin-tax-payments', JSON.stringify(payments));
    } catch (err) {
      console.error('Error saving tax payments to localStorage:', err);
    }
  };

  // Get tax payments (from localStorage) - use state to allow updates
  const [taxPayments, setTaxPayments] = useState(() => loadTaxPayments());

  // Refresh tax payments when needed
  const refreshTaxPayments = () => {
    setTaxPayments(loadTaxPayments());
  };

  // Helper function to download reports
  const downloadReport = (reportName: string, format: 'csv' | 'pdf', params: { startDate?: string; endDate?: string; agingPeriod?: string }) => {
    // Generate file content based on report type
    let content = '';
    let filename = '';
    
    if (format === 'csv') {
      // Generate CSV content
      const headers: string[] = [];
      const rows: string[][] = [];
      
      if (reportName === 'Revenue Summary') {
        headers.push('Service Type', 'Amount', 'Date', 'Patient');
        // Mock data
        rows.push(['Consultations', '$15,000', params.startDate || '', 'Various']);
        rows.push(['Procedures', '$45,000', params.startDate || '', 'Various']);
        rows.push(['Medications', '$8,500', params.startDate || '', 'Various']);
        content = [headers, ...rows].map(row => row.join(',')).join('\n');
        filename = `Revenue_Summary_${params.startDate || 'all'}_${params.endDate || 'all'}.csv`;
      } else if (reportName === 'Expense Breakdown') {
        headers.push('Expense Type', 'Amount', 'Date', 'Category');
        rows.push(['Salaries', '$120,000', params.startDate || '', 'Personnel']);
        rows.push(['Supplies', '$25,000', params.startDate || '', 'Operations']);
        rows.push(['Utilities', '$8,000', params.startDate || '', 'Operations']);
        content = [headers, ...rows].map(row => row.join(',')).join('\n');
        filename = `Expense_Breakdown_${params.startDate || 'all'}_${params.endDate || 'all'}.csv`;
      } else if (reportName === 'Payroll Report') {
        headers.push('Employee', 'Salary', 'Benefits', 'Deductions', 'Net Pay');
        rows.push(['Dr. Amelia Harper', '$15,000', '$2,000', '$1,500', '$15,500']);
        rows.push(['Dr. Emily Carter', '$15,417', '$2,000', '$1,542', '$15,875']);
        content = [headers, ...rows].map(row => row.join(',')).join('\n');
        filename = `Payroll_Report_${params.startDate || 'all'}_${params.endDate || 'all'}.csv`;
      } else if (reportName === 'Tax Report') {
        headers.push('Tax Type', 'Amount', 'Period', 'Status');
        rows.push(['Income Tax', '$125,000', params.startDate || '', 'Paid']);
        rows.push(['Payroll Tax', '$45,000', params.startDate || '', 'Paid']);
        rows.push(['Property Tax', '$30,000', params.startDate || '', 'Pending']);
        content = [headers, ...rows].map(row => row.join(',')).join('\n');
        filename = `Tax_Report_${params.startDate || 'all'}_${params.endDate || 'all'}.csv`;
      } else if (reportName === 'Accounts Receivable Aging') {
        headers.push('Patient', 'Invoice', 'Amount', 'Days Past Due', 'Status');
        rows.push(['John Doe', 'INV-001', '$1,500', '15', 'Pending']);
        rows.push(['Jane Smith', 'INV-002', '$2,300', '45', 'Overdue']);
        content = [headers, ...rows].map(row => row.join(',')).join('\n');
        filename = `AR_Aging_${params.agingPeriod || 'all'}days.csv`;
      } else if (reportName === 'Accounts Payable Aging') {
        headers.push('Vendor', 'Invoice', 'Amount', 'Days Past Due', 'Status');
        rows.push(['MedSupply Co.', 'INV-AP-001', '$5,000', '10', 'Pending']);
        rows.push(['Utility Corp', 'INV-AP-002', '$3,200', '60', 'Overdue']);
        content = [headers, ...rows].map(row => row.join(',')).join('\n');
        filename = `AP_Aging_${params.agingPeriod || 'all'}days.csv`;
      }
      
      // Create and download CSV file
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`${reportName} downloaded as CSV`);
    } else if (format === 'pdf') {
      // For PDF, we'll create a simple text file as a placeholder
      // In a real app, this would generate an actual PDF
      const pdfContent = `${reportName}\n\nGenerated on: ${new Date().toLocaleDateString()}\n\nParameters:\n${JSON.stringify(params, null, 2)}`;
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      filename = `${reportName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`${reportName} downloaded as PDF`);
    }
  };

  // Fetch billing data based on active tab
  const { data: billingData, isLoading, error } = useQuery<BillingData>({
    queryKey: ['hospital', 'billings', hospitalId, activeTab, revenuePeriod],
    queryFn: async () => {
      try {
        const result = await HospitalAPI.getBillings(hospitalId, activeTab, revenuePeriod);
        console.log('[Billings] Fetched billing data:', result);
        return result;
      } catch (err) {
        console.error('[Billings] Error fetching billing data:', err);
        throw err;
      }
    },
    retry: 1,
  });

  // Get current taxes (from localStorage or API)
  const currentTaxes = useMemo(() => {
    const stored = loadTaxes();
    console.log('[Billings] Loaded taxes from localStorage:', stored);
    // Merge with API data if available
    if (billingData?.taxes) {
      return { ...billingData.taxes, ...stored };
    }
    return stored;
  }, [billingData?.taxes]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format currency with decimals
  const formatCurrencyDetailed = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Handle download reports
  const handleDownloadReport = () => {
    if (!billingData?.overview) {
      toast.error('No data available to download');
      return;
    }

    const reportContent = `
============================================================
                    FINANCIAL REPORT
============================================================

Generated: ${new Date().toLocaleString()}

------------------------------------------------------------
FINANCIAL OVERVIEW
------------------------------------------------------------
Total Earnings: ${formatCurrency(billingData.overview.totalEarnings)}
Total Revenue: ${formatCurrency(billingData.overview.totalRevenue)}
Accounts Receivable: ${formatCurrency(billingData.overview.accountsReceivable)}

------------------------------------------------------------
REVENUE TREND
------------------------------------------------------------
${billingData.overview.revenueChart.map(item => 
  `${item.date}: ${formatCurrency(item.amount)}`
).join('\n')}

------------------------------------------------------------
TOP CONTRIBUTORS
------------------------------------------------------------
${billingData.overview.topContributors.map((contributor, idx) => 
  `${idx + 1}. ${contributor.name}: ${formatCurrency(contributor.amount)}`
).join('\n')}

============================================================
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success('Financial report downloaded successfully');
  };

  // Top Contributors table columns
  const topContributorsColumns: ColumnDef<{ name: string; amount: number }>[] = [
    {
      accessorKey: 'name',
      header: 'Department/Service',
      cell: ({ row }) => (
        <span className="font-semibold text-foreground-light dark:text-foreground-dark">
          {row.original.name}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Revenue',
      cell: ({ row }) => (
        <span className="text-primary font-semibold">
          {formatCurrency(row.original.amount)}
        </span>
      ),
    },
  ];

  // Filter accounts payable data - moved to top level to comply with Rules of Hooks
  const filteredAccountsPayable = useMemo(() => {
    if (!billingData?.accountsPayable) return [];
    
    let filtered = [...billingData.accountsPayable];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(item => {
        const dueDate = new Date(item.due_date);
        const filterDate = new Date(dateFilter);
        // Match if the due date is on the same day
        return dueDate.toDateString() === filterDate.toDateString();
      });
    }

    return filtered;
  }, [billingData?.accountsPayable, searchQuery, statusFilter, categoryFilter, dateFilter]);

  // Mark bill as paid mutation
  const markBillAsPaidMutation = useMutation({
    mutationFn: async (billId: number) => {
      // Update in localStorage
      const stored = localStorage.getItem('hospital-admin-accounts-payable');
      if (stored) {
        const bills: Array<{
          id: number;
          description: string;
          amount: number;
          status: 'pending' | 'paid';
          category: string;
          due_date: string;
        }> = JSON.parse(stored);
        const updated = bills.map(bill => 
          bill.id === billId ? { ...bill, status: 'paid' as const } : bill
        );
        localStorage.setItem('hospital-admin-accounts-payable', JSON.stringify(updated));
      }
      return { ok: true };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['hospital', 'billings', hospitalId, 'accounts-payable'] });
      await queryClient.refetchQueries({ queryKey: ['hospital', 'billings', hospitalId, 'accounts-payable'] });
      toast.success('Bill marked as paid successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to mark bill as paid');
    },
  });

  // Handle mark as paid
  const handleMarkAsPaid = (billId: number) => {
    if (window.confirm('Are you sure you want to mark this bill as paid?')) {
      markBillAsPaidMutation.mutate(billId);
    }
  };

  // Filter accounts receivable data
  const filteredAccountsReceivable = useMemo(() => {
    if (!billingData?.accountsReceivable) return [];
    
    let filtered = [...billingData.accountsReceivable];

    // Search filter (patient name, invoice number, service)
    if (arSearchQuery) {
      const query = arSearchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.patient_name.toLowerCase().includes(query) ||
        item.invoice_number.toLowerCase().includes(query) ||
        item.service_rendered.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (arStatusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === arStatusFilter);
    }

    // Service filter
    if (arServiceFilter !== 'all') {
      filtered = filtered.filter(item => item.service_rendered === arServiceFilter);
    }

    // Date filter
    if (arDateFilter) {
      filtered = filtered.filter(item => {
        const dueDate = new Date(item.due_date);
        const filterDate = new Date(arDateFilter);
        return dueDate.toDateString() === filterDate.toDateString();
      });
    }

    return filtered;
  }, [billingData?.accountsReceivable, arSearchQuery, arStatusFilter, arServiceFilter, arDateFilter]);

  // Get unique services for filter
  const uniqueServices = useMemo(() => {
    if (!billingData?.accountsReceivable) return [];
    const services = new Set(billingData.accountsReceivable.map(item => item.service_rendered));
    return Array.from(services).sort();
  }, [billingData?.accountsReceivable]);

  // Handle record payment - marks receivable as paid and saves to DB (localStorage)
  const handleRecordPayment = async (receivableId: number) => {
    const receivable = filteredAccountsReceivable.find(r => r.id === receivableId);
    if (!receivable) {
      toast.error('Receivable not found');
      return;
    }

    // Update in localStorage (our mock DB)
    try {
      const stored = localStorage.getItem('hospital-admin-accounts-receivable');
      let receivables: typeof filteredAccountsReceivable = stored ? JSON.parse(stored) : [];
      
      // Check if receivable exists in localStorage
      const existingIndex = receivables.findIndex(r => r.id === receivableId);
      
      if (existingIndex >= 0) {
        // Update existing receivable
        receivables[existingIndex] = { ...receivables[existingIndex], status: 'paid' as const };
      } else {
        // Add new receivable with paid status (in case it came from patient billing)
        receivables.push({
          ...receivable,
          status: 'paid' as const,
        });
      }
      
      // Save to localStorage (mock DB)
      localStorage.setItem('hospital-admin-accounts-receivable', JSON.stringify(receivables));
      
      // Also try to mark as paid in patient billing if we can find the patient
      // This would update the patient's billing record
      try {
        // Extract patient name and try to find patient ID
        // For now, we'll just log it - in production this would call the API
        console.log(`[Payment Recorded] Invoice: ${receivable.invoice_number}, Patient: ${receivable.patient_name}, Amount: ${formatCurrency(receivable.amount_due)}`);
      } catch (err) {
        console.error('Error updating patient billing:', err);
      }
      
      // Invalidate and refetch queries to update UI
      await queryClient.invalidateQueries({ queryKey: ['hospital', 'billings', hospitalId, 'accounts-receivable'] });
      await queryClient.refetchQueries({ queryKey: ['hospital', 'billings', hospitalId, 'accounts-receivable'] });
      
      toast.success(`Payment of ${formatCurrency(receivable.amount_due)} recorded successfully for ${receivable.patient_name}`);
    } catch (err) {
      console.error('Error recording payment:', err);
      toast.error('Failed to record payment. Please try again.');
    }
  };

  // Handle send reminder
  const handleSendReminder = (receivableId: number) => {
    toast.success('Reminder sent successfully');
  };

  // Handle view details
  const handleViewDetails = (receivableId: number) => {
    const receivable = filteredAccountsReceivable.find(r => r.id === receivableId);
    if (receivable) {
      toast.info(`Invoice: ${receivable.invoice_number} - ${receivable.patient_name}`);
    }
  };

  // Accounts Receivable table columns
  const accountsReceivableColumns: ColumnDef<typeof filteredAccountsReceivable[0]>[] = [
    {
      accessorKey: 'patient_name',
      header: 'Patient/Payer',
      cell: ({ row }) => (
        <span className="font-semibold text-foreground-light dark:text-foreground-dark">
          {row.original.patient_name}
        </span>
      ),
    },
    {
      accessorKey: 'invoice_number',
      header: 'Invoice #',
      cell: ({ row }) => (
        <button
          onClick={() => handleViewDetails(row.original.id)}
          className="text-primary hover:text-primary/80 font-medium underline"
        >
          {row.original.invoice_number}
        </button>
      ),
    },
    {
      accessorKey: 'service_rendered',
      header: 'Service Rendered',
      cell: ({ row }) => (
        <button
          onClick={() => handleViewDetails(row.original.id)}
          className="text-primary hover:text-primary/80 font-medium underline"
        >
          {row.original.service_rendered}
        </button>
      ),
    },
    {
      accessorKey: 'amount_due',
      header: 'Amount Due',
      cell: ({ row }) => (
        <span className="font-semibold text-foreground-light dark:text-foreground-dark">
          {formatCurrency(row.original.amount_due)}
        </span>
      ),
    },
    {
      accessorKey: 'due_date',
      header: 'Due Date',
      cell: ({ row }) => (
        <button
          onClick={() => handleViewDetails(row.original.id)}
          className="text-primary hover:text-primary/80 font-medium underline"
        >
          {new Date(row.original.due_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })}
        </button>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const statusColors = {
          pending: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
          paid: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
          overdue: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300',
          collection: 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300',
        };
        return (
          <span className={clsx(
            'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
            statusColors[status]
          )}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const status = row.original.status;
        if (status === 'paid') {
          return (
            <button
              onClick={() => handleViewDetails(row.original.id)}
              className="text-primary hover:text-primary/80 font-medium underline"
            >
              View Details
            </button>
          );
        } else if (status === 'overdue' || status === 'collection') {
          return (
            <button
              onClick={() => handleSendReminder(row.original.id)}
              className="text-primary hover:text-primary/80 font-medium underline"
            >
              Send Reminder
            </button>
          );
        } else {
          return (
            <button
              onClick={() => {
                const receivable = row.original;
                if (window.confirm(`Record payment of ${formatCurrency(receivable.amount_due)} for ${receivable.patient_name}?`)) {
                  handleRecordPayment(row.original.id);
                }
              }}
              className="text-primary hover:text-primary/80 font-medium underline"
            >
              Record Payment
            </button>
          );
        }
      },
    },
  ];

  // Payroll table columns (with sorting enabled)
  const payrollColumns: ColumnDef<{ 
    id: number; 
    name: string; 
    role: string; 
    department: string; 
    salary: number;
    benefits?: string[];
    pay_frequency?: string;
    last_paid_date?: string;
  }>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <button
          onClick={() => navigate(`/hospital/billings/payroll/${row.original.id}`)}
          className="font-semibold text-primary hover:text-primary/80 underline text-left"
        >
          {row.original.name}
        </button>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role/Specialty',
      cell: ({ row }) => (
        <span className="text-subtle-light dark:text-subtle-dark">
          {row.original.role}
        </span>
      ),
    },
    {
      accessorKey: 'salary',
      header: 'Current Salary',
      cell: ({ row }) => (
        <span className="font-semibold text-foreground-light dark:text-foreground-dark">
          {formatCurrency(row.original.salary)}/month
        </span>
      ),
    },
    {
      accessorKey: 'benefits',
      header: 'Benefits',
      cell: ({ row }) => (
        <span className="text-subtle-light dark:text-subtle-dark">
          {row.original.benefits?.join(', ') || 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'pay_frequency',
      header: 'Pay Frequency',
      cell: ({ row }) => (
        <span className="text-subtle-light dark:text-subtle-dark">
          {row.original.pay_frequency || 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'last_paid_date',
      header: 'Last Paid Date',
      cell: ({ row }) => (
        <span className="text-subtle-light dark:text-subtle-dark">
          {row.original.last_paid_date || 'N/A'}
        </span>
      ),
    },
  ];

  // Accounts Payable table columns
  const accountsPayableColumns: ColumnDef<typeof filteredAccountsPayable[0]>[] = [
    {
      accessorKey: 'vendor',
      header: 'Vendor/Supplier',
      cell: ({ row }) => (
        <span className="font-semibold text-foreground-light dark:text-foreground-dark">
          {row.original.vendor}
        </span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="font-semibold text-foreground-light dark:text-foreground-dark">
          {row.original.description}
        </span>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span className="text-subtle-light dark:text-subtle-dark">
          {row.original.category}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <span className="font-semibold text-foreground-light dark:text-foreground-dark">
          {formatCurrency(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: 'due_date',
      header: 'Due Date',
      cell: ({ row }) => {
        const dueDate = new Date(row.original.due_date);
        const isOverdue = dueDate < new Date() && row.original.status === 'pending';
        return (
          <span className={clsx(
            isOverdue && 'text-red-600 dark:text-red-400 font-semibold'
          )}>
            {dueDate.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
            {isOverdue && ' (Overdue)'}
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span className={clsx(
            'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
            status === 'paid'
              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
              : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
          )}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const bill = row.original;
        if (bill.status === 'paid') {
          return <span className="text-subtle-light dark:text-subtle-dark text-sm">—</span>;
        }
        return (
          <button
            onClick={() => handleMarkAsPaid(bill.id)}
            disabled={markBillAsPaidMutation.isPending}
            className="h-8 px-3 rounded-lg font-medium bg-primary text-white text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {markBillAsPaidMutation.isPending ? 'Updating...' : 'Mark as Paid'}
          </button>
        );
      },
    },
  ];

  const tabs: Array<{ id: TabType; label: string; icon: string }> = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'accounts-payable', label: 'Accounts Payable', icon: 'receipt' },
    { id: 'accounts-receivable', label: 'Accounts Receivable', icon: 'account_balance_wallet' },
    { id: 'payroll', label: 'Payroll & Salaries', icon: 'payments' },
    { id: 'financial-reports', label: 'Financial Reports', icon: 'description' },
    { id: 'taxes', label: 'Taxes', icon: 'calculate' },
  ];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground-light dark:text-foreground-dark mb-2">
            Billings
          </h1>
          <p className="text-subtle-light dark:text-subtle-dark">
            Manage financial operations, accounts, payroll, and reports
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-border-light dark:border-border-dark overflow-x-auto">
          <div className="flex space-x-1 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'px-4 py-3 border-b-2 font-semibold transition-colors whitespace-nowrap flex items-center gap-2',
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-subtle-light dark:text-subtle-dark hover:text-primary hover:border-primary/50'
                )}
              >
                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-300">
              Error loading billing data: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {billingData?.overview ? (
                  <div className="space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                      {/* Total Earnings */}
                      <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-4 sm:p-6 min-w-0">
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <span className="text-xs sm:text-sm font-medium text-subtle-light dark:text-subtle-dark truncate">
                            Total Earnings
                          </span>
                          <span className="material-symbols-outlined text-primary text-lg sm:text-xl flex-shrink-0">
                            trending_up
                          </span>
                        </div>
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground-light dark:text-foreground-dark truncate">
                          {formatCurrency(billingData.overview.totalEarnings)}
                        </p>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1 line-clamp-2">
                          Net income after expenses
                        </p>
                      </div>

                      {/* Total Revenue */}
                      <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-4 sm:p-6 min-w-0">
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <span className="text-xs sm:text-sm font-medium text-subtle-light dark:text-subtle-dark truncate">
                            Total Revenue
                          </span>
                          <span className="material-symbols-outlined text-primary text-lg sm:text-xl flex-shrink-0">
                            attach_money
                          </span>
                        </div>
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground-light dark:text-foreground-dark truncate">
                          {formatCurrency(billingData.overview.totalRevenue)}
                        </p>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1 line-clamp-2">
                          Total income generated
                        </p>
                      </div>

                      {/* Accounts Receivable */}
                      <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-4 sm:p-6 min-w-0">
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <span className="text-xs sm:text-sm font-medium text-subtle-light dark:text-subtle-dark truncate">
                            Accounts Receivable
                          </span>
                          <span className="material-symbols-outlined text-primary text-lg sm:text-xl flex-shrink-0">
                            account_balance_wallet
                          </span>
                        </div>
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground-light dark:text-foreground-dark truncate">
                          {formatCurrency(billingData.overview.accountsReceivable)}
                        </p>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1 line-clamp-2">
                          Outstanding payments
                        </p>
                      </div>
                    </div>

                    {/* Revenue Chart */}
                    <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-6">
                      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                        <h2 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
                          Revenue Generated
                        </h2>
                        <div className="w-full sm:w-auto sm:min-w-[180px]">
                          <Select
                            value={revenuePeriod}
                            onChange={(e) => setRevenuePeriod(e.target.value as PeriodType)}
                            options={[
                              { value: 'daily', label: 'Daily' },
                              { value: 'weekly', label: 'Weekly' },
                              { value: 'monthly', label: 'Monthly' },
                              { value: 'yearly', label: 'Yearly' },
                            ]}
                            className="h-10"
                          />
                        </div>
                      </div>
                      {billingData.overview.revenueChart && billingData.overview.revenueChart.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart
                            data={billingData.overview.revenueChart.map(item => ({
                              ...item,
                              amount: item.amount,
                            }))}
                            margin={{ top: 10, right: 30, left: 0, bottom: revenuePeriod === 'monthly' ? 40 : 0 }}
                          >
                            <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#607afb" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#607afb" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                            <XAxis
                              dataKey="date"
                              tick={{ fill: 'currentColor', fontSize: 12 }}
                              className="text-subtle-light dark:text-subtle-dark"
                              angle={revenuePeriod === 'yearly' ? 0 : revenuePeriod === 'monthly' ? -45 : 0}
                              textAnchor={revenuePeriod === 'monthly' ? 'end' : 'middle'}
                              height={revenuePeriod === 'monthly' ? 60 : 30}
                            />
                            <YAxis
                              tick={{ fill: 'currentColor', fontSize: 12 }}
                              className="text-subtle-light dark:text-subtle-dark"
                              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'var(--card-light)',
                                border: '1px solid var(--border-light)',
                                borderRadius: '0.5rem',
                              }}
                              labelStyle={{ color: 'var(--foreground-light)' }}
                              formatter={(value: number) => formatCurrency(value)}
                            />
                            <Area
                              type="monotone"
                              dataKey="amount"
                              stroke="#607afb"
                              fillOpacity={1}
                              fill="url(#colorRevenue)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <EmptyState
                          title="No revenue data"
                          description="Revenue chart data will appear here"
                        />
                      )}
                    </div>

                    {/* Top Contributors */}
                    <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
                          Top Revenue Contributors
                        </h2>
                      </div>
                    {billingData.overview.topContributors && billingData.overview.topContributors.length > 0 ? (
                      <DataTable
                        data={billingData.overview.topContributors}
                        columns={topContributorsColumns}
                      />
                    ) : (
                        <EmptyState
                          title="No contributors found"
                          description="Revenue contributor data will appear here"
                        />
                      )}
                    </div>

                    {/* Download Reports Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={handleDownloadReport}
                        className="h-11 px-6 rounded-lg font-semibold bg-primary text-white shadow-soft hover:bg-primary/90 transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-base">download</span>
                        Download Financial Report
                      </button>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    title="No billing data available"
                    description="Billing overview data will appear here once available"
                  />
                )}
              </>
            )}

            {/* Accounts Payable Tab */}
            {activeTab === 'accounts-payable' && (
              <>
                {billingData?.accountsPayable ? (
                  <div className="space-y-6">
                    {/* Header with Add Button */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <h2 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
                          Accounts Payable
                        </h2>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark mt-1">
                          Manage bills and expenses
                        </p>
                      </div>
                      <button
                        onClick={() => setIsAddBillModalOpen(true)}
                        className="h-11 px-6 rounded-lg font-semibold bg-primary text-white shadow-soft hover:bg-primary/90 transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-base">add</span>
                        Add Bill/Expense
                      </button>
                    </div>

                    {/* Filters */}
                    <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-4 sm:p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <TextField
                          placeholder="Search by description..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="h-10"
                        />

                        {/* Status Filter */}
                        <Select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          options={[
                            { value: 'all', label: 'All Status' },
                            { value: 'pending', label: 'Pending' },
                            { value: 'paid', label: 'Paid' },
                          ]}
                          className="h-10"
                        />

                        {/* Category Filter */}
                        <Select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          options={[
                            { value: 'all', label: 'All Categories' },
                            { value: 'Supplies', label: 'Supplies' },
                            { value: 'Maintenance', label: 'Maintenance' },
                            { value: 'Utilities', label: 'Utilities' },
                            { value: 'Insurance', label: 'Insurance' },
                            { value: 'Other', label: 'Other' },
                          ]}
                          className="h-10"
                        />

                        {/* Date Filter */}
                        <DateTimePicker
                          type="date"
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value)}
                          placeholder="Filter by due date"
                          className="h-10"
                        />
                      </div>

                      {/* Clear Filters Button */}
                      {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || dateFilter) && (
                        <div className="mt-4">
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setStatusFilter('all');
                              setCategoryFilter('all');
                              setDateFilter('');
                            }}
                            className="text-sm text-primary hover:text-primary/80 font-medium"
                          >
                            Clear Filters
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Accounts Payable Table */}
                    <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-6">
                      {filteredAccountsPayable.length > 0 ? (
                        <DataTable
                          data={filteredAccountsPayable}
                          columns={accountsPayableColumns}
                        />
                      ) : (
                        <EmptyState
                          title="No bills found"
                          description="No bills match your current filters"
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    title="No accounts payable data available"
                    description="Accounts payable data will appear here once available"
                  />
                )}
              </>
            )}

            {/* Payroll & Salaries Tab */}
            {activeTab === 'payroll' && (
              <>
                {billingData?.payroll ? (
                  <div className="space-y-6">
                    {/* Header */}
                    <div>
                      <h2 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
                        Payroll & Salaries
                      </h2>
                      <p className="text-sm text-subtle-light dark:text-subtle-dark mt-1">
                        Manage staff compensation and payroll information
                      </p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-4 sm:p-6 min-w-0">
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <span className="text-xs sm:text-sm font-medium text-subtle-light dark:text-subtle-dark truncate">
                            Total Payroll
                          </span>
                          <span className="material-symbols-outlined text-primary text-lg sm:text-xl flex-shrink-0">
                            account_balance_wallet
                          </span>
                        </div>
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground-light dark:text-foreground-dark truncate">
                          {formatCurrency(
                            billingData.payroll.reduce((sum, emp) => sum + emp.salary, 0)
                          )}
                        </p>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1 line-clamp-2">
                          Monthly total
                        </p>
                      </div>

                      <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-4 sm:p-6 min-w-0">
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <span className="text-xs sm:text-sm font-medium text-subtle-light dark:text-subtle-dark truncate">
                            Average Salary
                          </span>
                          <span className="material-symbols-outlined text-primary text-lg sm:text-xl flex-shrink-0">
                            trending_up
                          </span>
                        </div>
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground-light dark:text-foreground-dark truncate">
                          {formatCurrency(
                            billingData.payroll.length > 0
                              ? billingData.payroll.reduce((sum, emp) => sum + emp.salary, 0) / billingData.payroll.length
                              : 0
                          )}
                        </p>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1 line-clamp-2">
                          Per employee
                        </p>
                      </div>

                      <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-4 sm:p-6 min-w-0">
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <span className="text-xs sm:text-sm font-medium text-subtle-light dark:text-subtle-dark truncate">
                            Total Employees
                          </span>
                          <span className="material-symbols-outlined text-primary text-lg sm:text-xl flex-shrink-0">
                            groups
                          </span>
                        </div>
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground-light dark:text-foreground-dark truncate">
                          {billingData.payroll.length}
                        </p>
                        <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1 line-clamp-2">
                          Staff members
                        </p>
                      </div>
                    </div>

                    {/* Payroll Summary */}
                    <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-6">
                      <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-4">
                        Payroll Summary
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-background-light dark:bg-background-dark rounded-lg p-4 border border-border-light dark:border-border-dark">
                          <span className="text-sm font-medium text-subtle-light dark:text-subtle-dark block mb-1">
                            Total Monthly Payroll
                          </span>
                          <span className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
                            {formatCurrency(
                              billingData.payroll.reduce((sum, emp) => sum + emp.salary, 0)
                            )}
                          </span>
                        </div>
                        <div className="bg-background-light dark:bg-background-dark rounded-lg p-4 border border-border-light dark:border-border-dark">
                          <span className="text-sm font-medium text-subtle-light dark:text-subtle-dark block mb-1">
                            Total Annual Payroll
                          </span>
                          <span className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
                            {formatCurrency(
                              billingData.payroll.reduce((sum, emp) => sum + emp.salary, 0) * 12
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payroll Table */}
                    <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-6">
                      {billingData.payroll.length > 0 ? (
                        <DataTable
                          data={billingData.payroll}
                          columns={payrollColumns}
                        />
                      ) : (
                        <EmptyState
                          title="No payroll data available"
                          description="Payroll information will appear here once available"
                        />
                      )}
                    </div>
                  </div>
                ) : isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Spinner />
                  </div>
                ) : error ? (
                  <EmptyState
                    title="Error loading payroll"
                    description={error && typeof error === 'object' && 'message' in error ? (error as Error).message : 'Failed to load payroll data'}
                  />
                ) : (
                  <EmptyState
                    title="No payroll data available"
                    description="Payroll data will appear here once available"
                  />
                )}
              </>
            )}

            {/* Accounts Receivable Tab */}
            {activeTab === 'accounts-receivable' && (
              <>
                {billingData?.accountsReceivable ? (
                  <div className="space-y-6">
                    {/* Header with Add Button */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <h2 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
                          Accounts Receivable
                        </h2>
                        <p className="text-sm text-subtle-light dark:text-subtle-dark mt-1">
                          Manage outstanding payments from patients
                        </p>
                      </div>
                      <button
                        onClick={() => setIsAddReceivableModalOpen(true)}
                        className="h-11 px-6 rounded-lg font-semibold bg-primary text-white shadow-soft hover:bg-primary/90 transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-base">add</span>
                        Add Receivable
                      </button>
                    </div>

                    {/* Filters */}
                    <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-4 sm:p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <TextField
                          placeholder="Search by patient, invoice, service..."
                          value={arSearchQuery}
                          onChange={(e) => setArSearchQuery(e.target.value)}
                          className="h-10"
                        />

                        {/* Status Filter */}
                        <Select
                          value={arStatusFilter}
                          onChange={(e) => setArStatusFilter(e.target.value)}
                          options={[
                            { value: 'all', label: 'All Status' },
                            { value: 'pending', label: 'Pending' },
                            { value: 'paid', label: 'Paid' },
                            { value: 'overdue', label: 'Overdue' },
                            { value: 'collection', label: 'Collection' },
                          ]}
                          className="h-10"
                        />

                        {/* Service Filter */}
                        <Select
                          value={arServiceFilter}
                          onChange={(e) => setArServiceFilter(e.target.value)}
                          options={[
                            { value: 'all', label: 'All Services' },
                            ...uniqueServices.map(service => ({
                              value: service,
                              label: service,
                            })),
                          ]}
                          className="h-10"
                        />

                        {/* Date Filter */}
                        <div className="flex-1 min-w-0">
                          <DateTimePicker
                            type="date"
                            value={arDateFilter}
                            onChange={(e) => setArDateFilter(e.target.value)}
                            placeholder="Filter by due date"
                            className="h-10"
                          />
                        </div>
                      </div>

                      {/* Clear Filters Button */}
                      {(arSearchQuery || arStatusFilter !== 'all' || arServiceFilter !== 'all' || arDateFilter) && (
                        <div className="mt-4">
                          <button
                            onClick={() => {
                              setArSearchQuery('');
                              setArStatusFilter('all');
                              setArServiceFilter('all');
                              setArDateFilter('');
                            }}
                            className="text-sm text-primary hover:text-primary/80 font-medium"
                          >
                            Clear Filters
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Accounts Receivable Table */}
                    <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-6">
                      {filteredAccountsReceivable.length > 0 ? (
                        <DataTable
                          data={filteredAccountsReceivable}
                          columns={accountsReceivableColumns}
                        />
                      ) : (
                        <EmptyState
                          title="No accounts receivable found"
                          description="No outstanding payments match your filters"
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    title="No accounts receivable data"
                    description="Accounts receivable information will appear here once available"
                  />
                )}
              </>
            )}

            {/* Financial Reports Tab */}
            {activeTab === 'financial-reports' && (
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground-light dark:text-foreground-dark mb-2">
                    Reports & Exports
                  </h2>
                  <p className="text-subtle-light dark:text-subtle-dark">
                    Generate and export financial reports for your hospital. Select a report type, specify the date range or parameters, and download the CSV file.
                  </p>
                </div>

                {/* Report Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue Summary */}
                  <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-6">
                    <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-2">
                      Revenue Summary
                    </h3>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark mb-4">
                      A summary of all revenue generated within the selected period, categorized by service type (e.g., consultations, procedures, medications).
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                          Start Date
                        </label>
                        <DateTimePicker
                          type="date"
                          value={revenueStartDate}
                          onChange={(e) => setRevenueStartDate(e.target.value)}
                          placeholder="mm/dd/yyyy"
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                          End Date
                        </label>
                        <DateTimePicker
                          type="date"
                          value={revenueEndDate}
                          onChange={(e) => setRevenueEndDate(e.target.value)}
                          placeholder="mm/dd/yyyy"
                          min={revenueStartDate}
                          className="h-12"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => {
                            if (!revenueStartDate || !revenueEndDate) {
                              toast.error('Please select both start and end dates');
                              return;
                            }
                            if (revenueStartDate > revenueEndDate) {
                              toast.error('End date must be after start date');
                              return;
                            }
                            downloadReport('Revenue Summary', 'csv', { startDate: revenueStartDate, endDate: revenueEndDate });
                          }}
                          className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-base">download</span>
                          Generate & Download CSV
                        </button>
                        <button
                          onClick={() => {
                            if (!revenueStartDate || !revenueEndDate) {
                              toast.error('Please select both start and end dates');
                              return;
                            }
                            if (revenueStartDate > revenueEndDate) {
                              toast.error('End date must be after start date');
                              return;
                            }
                            downloadReport('Revenue Summary', 'pdf', { startDate: revenueStartDate, endDate: revenueEndDate });
                          }}
                          className="px-4 py-2 bg-primary/10 dark:bg-primary/20 text-primary rounded-lg hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors font-medium flex items-center gap-2"
                          title="Download PDF"
                        >
                          <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expense Breakdown */}
                  <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-6">
                    <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-2">
                      Expense Breakdown
                    </h3>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark mb-4">
                      A detailed breakdown of all expenses incurred within the selected period, categorized by expense type (e.g., salaries, supplies, utilities).
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                          Start Date
                        </label>
                        <DateTimePicker
                          type="date"
                          value={expenseStartDate}
                          onChange={(e) => setExpenseStartDate(e.target.value)}
                          placeholder="mm/dd/yyyy"
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                          End Date
                        </label>
                        <DateTimePicker
                          type="date"
                          value={expenseEndDate}
                          onChange={(e) => setExpenseEndDate(e.target.value)}
                          placeholder="mm/dd/yyyy"
                          min={expenseStartDate}
                          className="h-12"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => {
                            if (!expenseStartDate || !expenseEndDate) {
                              toast.error('Please select both start and end dates');
                              return;
                            }
                            if (expenseStartDate > expenseEndDate) {
                              toast.error('End date must be after start date');
                              return;
                            }
                            downloadReport('Expense Breakdown', 'csv', { startDate: expenseStartDate, endDate: expenseEndDate });
                          }}
                          className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-base">download</span>
                          Generate & Download CSV
                        </button>
                        <button
                          onClick={() => {
                            if (!expenseStartDate || !expenseEndDate) {
                              toast.error('Please select both start and end dates');
                              return;
                            }
                            if (expenseStartDate > expenseEndDate) {
                              toast.error('End date must be after start date');
                              return;
                            }
                            downloadReport('Expense Breakdown', 'pdf', { startDate: expenseStartDate, endDate: expenseEndDate });
                          }}
                          className="px-4 py-2 bg-primary/10 dark:bg-primary/20 text-primary rounded-lg hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors font-medium flex items-center gap-2"
                          title="Download PDF"
                        >
                          <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Payroll Report */}
                  <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-6">
                    <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-2">
                      Payroll Report
                    </h3>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark mb-4">
                      A report detailing all payroll expenses, including salaries, benefits, and deductions, for the selected period.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                          Start Date
                        </label>
                        <DateTimePicker
                          type="date"
                          value={payrollStartDate}
                          onChange={(e) => setPayrollStartDate(e.target.value)}
                          placeholder="mm/dd/yyyy"
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                          End Date
                        </label>
                        <DateTimePicker
                          type="date"
                          value={payrollEndDate}
                          onChange={(e) => setPayrollEndDate(e.target.value)}
                          placeholder="mm/dd/yyyy"
                          min={payrollStartDate}
                          className="h-12"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => {
                            if (!payrollStartDate || !payrollEndDate) {
                              toast.error('Please select both start and end dates');
                              return;
                            }
                            if (payrollStartDate > payrollEndDate) {
                              toast.error('End date must be after start date');
                              return;
                            }
                            downloadReport('Payroll Report', 'csv', { startDate: payrollStartDate, endDate: payrollEndDate });
                          }}
                          className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-base">download</span>
                          Generate & Download CSV
                        </button>
                        <button
                          onClick={() => {
                            if (!payrollStartDate || !payrollEndDate) {
                              toast.error('Please select both start and end dates');
                              return;
                            }
                            if (payrollStartDate > payrollEndDate) {
                              toast.error('End date must be after start date');
                              return;
                            }
                            downloadReport('Payroll Report', 'pdf', { startDate: payrollStartDate, endDate: payrollEndDate });
                          }}
                          className="px-4 py-2 bg-primary/10 dark:bg-primary/20 text-primary rounded-lg hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors font-medium flex items-center gap-2"
                          title="Download PDF"
                        >
                          <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tax Report */}
                  <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-6">
                    <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-2">
                      Tax Report
                    </h3>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark mb-4">
                      A report summarizing all tax-related information, including taxes paid and outstanding balances, for the selected period.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                          Start Date
                        </label>
                        <DateTimePicker
                          type="date"
                          value={taxStartDate}
                          onChange={(e) => setTaxStartDate(e.target.value)}
                          placeholder="mm/dd/yyyy"
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                          End Date
                        </label>
                        <DateTimePicker
                          type="date"
                          value={taxEndDate}
                          onChange={(e) => setTaxEndDate(e.target.value)}
                          placeholder="mm/dd/yyyy"
                          min={taxStartDate}
                          className="h-12"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => {
                            if (!taxStartDate || !taxEndDate) {
                              toast.error('Please select both start and end dates');
                              return;
                            }
                            if (taxStartDate > taxEndDate) {
                              toast.error('End date must be after start date');
                              return;
                            }
                            downloadReport('Tax Report', 'csv', { startDate: taxStartDate, endDate: taxEndDate });
                          }}
                          className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-base">download</span>
                          Generate & Download CSV
                        </button>
                        <button
                          onClick={() => {
                            if (!taxStartDate || !taxEndDate) {
                              toast.error('Please select both start and end dates');
                              return;
                            }
                            if (taxStartDate > taxEndDate) {
                              toast.error('End date must be after start date');
                              return;
                            }
                            downloadReport('Tax Report', 'pdf', { startDate: taxStartDate, endDate: taxEndDate });
                          }}
                          className="px-4 py-2 bg-primary/10 dark:bg-primary/20 text-primary rounded-lg hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors font-medium flex items-center gap-2"
                          title="Download PDF"
                        >
                          <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Accounts Receivable Aging */}
                  <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-6">
                    <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-2">
                      Accounts Receivable Aging
                    </h3>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark mb-4">
                      A report showing the aging of outstanding accounts receivable, categorized by the number of days past due.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                          Aging Period
                        </label>
                        <Select
                          value={arAgingPeriod}
                          onChange={(e) => setArAgingPeriod(e.target.value)}
                          options={[
                            { value: '', label: 'Select aging period' },
                            { value: '30', label: '30 Days' },
                            { value: '60', label: '60 Days' },
                            { value: '90', label: '90 Days' },
                            { value: '120', label: '120 Days' },
                            { value: '180', label: '180 Days' },
                            { value: 'all', label: 'All Periods' },
                          ]}
                          className="h-12"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => {
                            if (!arAgingPeriod) {
                              toast.error('Please select an aging period');
                              return;
                            }
                            downloadReport('Accounts Receivable Aging', 'csv', { agingPeriod: arAgingPeriod });
                          }}
                          className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-base">download</span>
                          Generate & Download CSV
                        </button>
                        <button
                          onClick={() => {
                            if (!arAgingPeriod) {
                              toast.error('Please select an aging period');
                              return;
                            }
                            downloadReport('Accounts Receivable Aging', 'pdf', { agingPeriod: arAgingPeriod });
                          }}
                          className="px-4 py-2 bg-primary/10 dark:bg-primary/20 text-primary rounded-lg hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors font-medium flex items-center gap-2"
                          title="Download PDF"
                        >
                          <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Accounts Payable Aging */}
                  <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-6">
                    <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-2">
                      Accounts Payable Aging
                    </h3>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark mb-4">
                      A report showing the aging of outstanding accounts payable, categorized by the number of days past due.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                          Aging Period
                        </label>
                        <Select
                          value={apAgingPeriod}
                          onChange={(e) => setApAgingPeriod(e.target.value)}
                          options={[
                            { value: '', label: 'Select aging period' },
                            { value: '30', label: '30 Days' },
                            { value: '60', label: '60 Days' },
                            { value: '90', label: '90 Days' },
                            { value: '120', label: '120 Days' },
                            { value: '180', label: '180 Days' },
                            { value: 'all', label: 'All Periods' },
                          ]}
                          className="h-12"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => {
                            if (!apAgingPeriod) {
                              toast.error('Please select an aging period');
                              return;
                            }
                            downloadReport('Accounts Payable Aging', 'csv', { agingPeriod: apAgingPeriod });
                          }}
                          className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-base">download</span>
                          Generate & Download CSV
                        </button>
                        <button
                          onClick={() => {
                            if (!apAgingPeriod) {
                              toast.error('Please select an aging period');
                              return;
                            }
                            downloadReport('Accounts Payable Aging', 'pdf', { agingPeriod: apAgingPeriod });
                          }}
                          className="px-4 py-2 bg-primary/10 dark:bg-primary/20 text-primary rounded-lg hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors font-medium flex items-center gap-2"
                          title="Download PDF"
                        >
                          <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Taxes Tab */}
            {activeTab === 'taxes' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-1">
                      Tax Management
                    </h2>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">
                      View and manage tax obligations, payments, and records
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddTaxModalOpen(true)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                    Add New Tax
                  </button>
                </div>

                {/* Tax Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  {/* Income Tax */}
                  <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-4 sm:p-6 min-w-0">
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <h3 className="text-sm font-medium text-subtle-light dark:text-subtle-dark truncate">
                        Income Tax
                      </h3>
                      <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-xl flex-shrink-0">
                        receipt_long
                      </span>
                    </div>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground-light dark:text-foreground-dark truncate">
                      {formatCurrency(currentTaxes?.incomeTax || 0)}
                    </p>
                    <p className="text-xs sm:text-sm text-subtle-light dark:text-subtle-dark mt-1">
                      Annual obligation
                    </p>
                  </div>

                  {/* Payroll Tax */}
                  <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-4 sm:p-6 min-w-0">
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <h3 className="text-sm font-medium text-subtle-light dark:text-subtle-dark truncate">
                        Payroll Tax
                      </h3>
                      <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-xl flex-shrink-0">
                        account_balance
                      </span>
                    </div>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground-light dark:text-foreground-dark truncate">
                      {formatCurrency(currentTaxes?.payrollTax || 0)}
                    </p>
                    <p className="text-xs sm:text-sm text-subtle-light dark:text-subtle-dark mt-1">
                      Quarterly payments
                    </p>
                  </div>

                  {/* Property Tax */}
                  <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-4 sm:p-6 min-w-0">
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <h3 className="text-sm font-medium text-subtle-light dark:text-subtle-dark truncate">
                        Property Tax
                      </h3>
                      <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark text-xl flex-shrink-0">
                        home
                      </span>
                    </div>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground-light dark:text-foreground-dark truncate">
                      {formatCurrency(currentTaxes?.propertyTax || 0)}
                    </p>
                    <p className="text-xs sm:text-sm text-subtle-light dark:text-subtle-dark mt-1">
                      Annual assessment
                    </p>
                  </div>
                </div>

                {/* Custom Taxes Section */}
                {Object.keys(currentTaxes).filter(key => !['incomeTax', 'payrollTax', 'propertyTax'].includes(key)).length > 0 && (
                  <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-6">
                    <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-4">
                      Custom Taxes
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(currentTaxes)
                        .filter(([key]) => !['incomeTax', 'payrollTax', 'propertyTax'].includes(key))
                        .map(([key, amount]) => {
                          // Get the display name from metadata
                          let displayName = key.replace(/Tax$/, '').replace(/([A-Z])/g, ' $1').trim();
                          displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
                          
                          return (
                            <div key={key} className="bg-background-light dark:bg-background-dark rounded-lg p-4 border border-border-light dark:border-border-dark">
                              <div className="flex items-center justify-between mb-2 gap-2">
                                <h4 className="text-sm font-medium text-foreground-light dark:text-foreground-dark truncate">
                                  {displayName}
                                </h4>
                                <span className="material-symbols-outlined text-primary text-lg flex-shrink-0">
                                  calculate
                                </span>
                              </div>
                              <p className="text-xl font-bold text-foreground-light dark:text-foreground-dark truncate">
                                {formatCurrency(amount)}
                              </p>
                              <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                                Custom tax
                              </p>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Tax Details Table */}
                <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-6">
                  <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-4">
                    Tax Details
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border-light dark:border-border-dark">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-light dark:text-foreground-dark">
                            Tax Type
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-light dark:text-foreground-dark">
                            Amount
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-light dark:text-foreground-dark">
                            Due Date
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-light dark:text-foreground-dark">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-light dark:text-foreground-dark">
                            Payment Date
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-foreground-light dark:text-foreground-dark">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                            {/* Income Tax Row */}
                            <tr className="border-b border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors">
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <span className="material-symbols-outlined text-primary text-xl">
                                    receipt_long
                                  </span>
                                  <div>
                                    <p className="font-semibold text-foreground-light dark:text-foreground-dark">
                                      Income Tax
                                    </p>
                                    <p className="text-xs text-subtle-light dark:text-subtle-dark">
                                      Annual filing
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className="font-semibold text-foreground-light dark:text-foreground-dark">
                                  {formatCurrency(currentTaxes?.incomeTax || 0)}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-subtle-light dark:text-subtle-dark">
                                  {new Date(new Date().getFullYear(), 3, 15).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                {(() => {
                                  const lastPayment = taxPayments
                                    .filter(p => p.taxType === 'Income Tax' && p.status === 'paid')
                                    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0];
                                  const isPaid = lastPayment && new Date(lastPayment.paymentDate) >= new Date(new Date().getFullYear(), 0, 1);
                                  return (
                                    <span className={clsx(
                                      'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                                      isPaid
                                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                        : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                                    )}>
                                      {isPaid ? 'Paid' : 'Pending'}
                                    </span>
                                  );
                                })()}
                              </td>
                              <td className="py-4 px-4">
                                {(() => {
                                  const lastPayment = taxPayments
                                    .filter(p => p.taxType === 'Income Tax' && p.status === 'paid')
                                    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0];
                                  return lastPayment ? (
                                    <span className="text-subtle-light dark:text-subtle-dark">
                                      {new Date(lastPayment.paymentDate).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric', 
                                        year: 'numeric' 
                                      })}
                                    </span>
                                  ) : (
                                    <span className="text-subtle-light dark:text-subtle-dark">—</span>
                                  );
                                })()}
                              </td>
                              <td className="py-4 px-4 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedTax({ type: 'Income Tax', amount: currentTaxes?.incomeTax || 0 });
                                    setIsTaxDetailsModalOpen(true);
                                  }}
                                  className="text-primary hover:text-primary/80 font-medium text-sm"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>

                            {/* Payroll Tax Row */}
                            <tr className="border-b border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors">
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <span className="material-symbols-outlined text-primary text-xl">
                                    account_balance
                                  </span>
                                  <div>
                                    <p className="font-semibold text-foreground-light dark:text-foreground-dark">
                                      Payroll Tax
                                    </p>
                                    <p className="text-xs text-subtle-light dark:text-subtle-dark">
                                      Quarterly payments
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className="font-semibold text-foreground-light dark:text-foreground-dark">
                                  {formatCurrency(currentTaxes?.payrollTax || 0)}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-subtle-light dark:text-subtle-dark">
                                  {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 15).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                {(() => {
                                  const lastPayment = taxPayments
                                    .filter(p => p.taxType === 'Payroll Tax' && p.status === 'paid')
                                    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0];
                                  const isPaid = lastPayment && new Date(lastPayment.paymentDate) >= new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1);
                                  return (
                                    <span className={clsx(
                                      'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                                      isPaid
                                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                        : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                                    )}>
                                      {isPaid ? 'Paid' : 'Pending'}
                                    </span>
                                  );
                                })()}
                              </td>
                              <td className="py-4 px-4">
                                {(() => {
                                  const lastPayment = taxPayments
                                    .filter(p => p.taxType === 'Payroll Tax' && p.status === 'paid')
                                    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0];
                                  return lastPayment ? (
                                    <span className="text-subtle-light dark:text-subtle-dark">
                                      {new Date(lastPayment.paymentDate).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric', 
                                        year: 'numeric' 
                                      })}
                                    </span>
                                  ) : (
                                    <span className="text-subtle-light dark:text-subtle-dark">—</span>
                                  );
                                })()}
                              </td>
                              <td className="py-4 px-4 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedTax({ type: 'Payroll Tax', amount: currentTaxes?.payrollTax || 0 });
                                    setIsRecordPaymentModalOpen(true);
                                  }}
                                  className="text-primary hover:text-primary/80 font-medium text-sm"
                                >
                                  Record Payment
                                </button>
                              </td>
                            </tr>

                            {/* Property Tax Row */}
                            <tr className="border-b border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors">
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <span className="material-symbols-outlined text-primary text-xl">
                                    home
                                  </span>
                                  <div>
                                    <p className="font-semibold text-foreground-light dark:text-foreground-dark">
                                      Property Tax
                                    </p>
                                    <p className="text-xs text-subtle-light dark:text-subtle-dark">
                                      Annual assessment
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className="font-semibold text-foreground-light dark:text-foreground-dark">
                                  {formatCurrency(currentTaxes?.propertyTax || 0)}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-subtle-light dark:text-subtle-dark">
                                  {new Date(new Date().getFullYear() + 1, 0, 31).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                {(() => {
                                  const lastPayment = taxPayments
                                    .filter(p => p.taxType === 'Property Tax' && p.status === 'paid')
                                    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0];
                                  const isPaid = lastPayment && new Date(lastPayment.paymentDate) >= new Date(new Date().getFullYear(), 0, 1);
                                  return (
                                    <span className={clsx(
                                      'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                                      isPaid
                                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                        : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                                    )}>
                                      {isPaid ? 'Paid' : 'Pending'}
                                    </span>
                                  );
                                })()}
                              </td>
                              <td className="py-4 px-4">
                                {(() => {
                                  const lastPayment = taxPayments
                                    .filter(p => p.taxType === 'Property Tax' && p.status === 'paid')
                                    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0];
                                  return lastPayment ? (
                                    <span className="text-subtle-light dark:text-subtle-dark">
                                      {new Date(lastPayment.paymentDate).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric', 
                                        year: 'numeric' 
                                      })}
                                    </span>
                                  ) : (
                                    <span className="text-subtle-light dark:text-subtle-dark">—</span>
                                  );
                                })()}
                              </td>
                              <td className="py-4 px-4 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedTax({ type: 'Property Tax', amount: currentTaxes?.propertyTax || 0 });
                                    setIsRecordPaymentModalOpen(true);
                                  }}
                                  className="text-primary hover:text-primary/80 font-medium text-sm"
                                >
                                  Record Payment
                                </button>
                              </td>
                            </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tax Payment History */}
                <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft p-6">
                  <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-4">
                    Payment History
                  </h3>
                  <div className="space-y-3">
                        {taxPayments
                          .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
                          .map((payment) => {
                            const getIcon = (taxType: string) => {
                              if (taxType.includes('Income')) return 'receipt_long';
                              if (taxType.includes('Payroll')) return 'account_balance';
                              if (taxType.includes('Property')) return 'home';
                              return 'calculate';
                            };
                            return (
                              <div
                                key={payment.id}
                                className="flex items-center justify-between p-4 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-xl">
                                      {getIcon(payment.taxType)}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-semibold text-foreground-light dark:text-foreground-dark">
                                      {payment.taxType} Payment
                                    </p>
                                    <p className="text-sm text-subtle-light dark:text-subtle-dark">
                                      {new Date(payment.paymentDate).toLocaleDateString('en-US', { 
                                        month: 'long', 
                                        day: 'numeric', 
                                        year: 'numeric' 
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-foreground-light dark:text-foreground-dark">
                                    {formatCurrency(payment.amount)}
                                  </p>
                                  <span className={clsx(
                                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1',
                                    payment.status === 'paid'
                                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                      : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                                  )}>
                                    {payment.status === 'paid' ? 'Paid' : 'Pending'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        {taxPayments.length === 0 && (
                          <EmptyState
                            title="No payment history"
                            description="Tax payment history will appear here once payments are recorded"
                          />
                        )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modals */}
        {/* Tax Details Modal */}
        <Modal
          isOpen={isTaxDetailsModalOpen}
          onClose={() => {
            setIsTaxDetailsModalOpen(false);
            setSelectedTax(null);
          }}
          title={selectedTax ? `${selectedTax.type} Details` : 'Tax Details'}
        >
          {selectedTax && (
            <div className="space-y-4">
              <div className="bg-background-light dark:bg-background-dark rounded-lg p-4">
                <h4 className="font-semibold text-foreground-light dark:text-foreground-dark mb-3">
                  Tax Information
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-subtle-light dark:text-subtle-dark">Tax Type:</span>
                    <span className="font-semibold text-foreground-light dark:text-foreground-dark">
                      {selectedTax.type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-subtle-light dark:text-subtle-dark">Amount:</span>
                    <span className="font-semibold text-foreground-light dark:text-foreground-dark">
                      {formatCurrency(selectedTax.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-subtle-light dark:text-subtle-dark">Payment Frequency:</span>
                    <span className="font-semibold text-foreground-light dark:text-foreground-dark">
                      {selectedTax.type === 'Income Tax' ? 'Annual' : selectedTax.type === 'Payroll Tax' ? 'Quarterly' : 'Annual'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-background-light dark:bg-background-dark rounded-lg p-4">
                <h4 className="font-semibold text-foreground-light dark:text-foreground-dark mb-3">
                  Payment History
                </h4>
                <div className="space-y-2">
                  {taxPayments
                    .filter(p => p.taxType === selectedTax.type)
                    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
                    .map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center py-2 border-b border-border-light dark:border-border-dark last:border-0">
                        <div>
                          <p className="text-sm font-medium text-foreground-light dark:text-foreground-dark">
                            {new Date(payment.paymentDate).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                          {payment.notes && (
                            <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                              {payment.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground-light dark:text-foreground-dark">
                            {formatCurrency(payment.amount)}
                          </p>
                          <span className={clsx(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1',
                            payment.status === 'paid'
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                              : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                          )}>
                            {payment.status === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  {taxPayments.filter(p => p.taxType === selectedTax.type).length === 0 && (
                    <p className="text-sm text-subtle-light dark:text-subtle-dark text-center py-4">
                      No payment history available
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-background-light dark:bg-background-dark rounded-lg p-4">
                <h4 className="font-semibold text-foreground-light dark:text-foreground-dark mb-3">
                  Outstanding Balance
                </h4>
                {(() => {
                  const totalPaid = taxPayments
                    .filter(p => p.taxType === selectedTax.type && p.status === 'paid')
                    .reduce((sum, p) => sum + p.amount, 0);
                  const outstanding = selectedTax.amount - totalPaid;
                  return (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-subtle-light dark:text-subtle-dark">Total Amount:</span>
                        <span className="font-semibold text-foreground-light dark:text-foreground-dark">
                          {formatCurrency(selectedTax.amount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-subtle-light dark:text-subtle-dark">Total Paid:</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(totalPaid)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-border-light dark:border-border-dark">
                        <span className="font-semibold text-foreground-light dark:text-foreground-dark">Outstanding:</span>
                        <span className={clsx(
                          'font-bold',
                          outstanding > 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-green-600 dark:text-green-400'
                        )}>
                          {formatCurrency(outstanding)}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </Modal>

        {/* Record Payment Modal */}
        <Modal
          isOpen={isRecordPaymentModalOpen}
          onClose={() => {
            setIsRecordPaymentModalOpen(false);
            setSelectedTax(null);
            setTaxPaymentFormData({ paymentDate: '', amount: '', notes: '' });
          }}
          title={selectedTax ? `Record Payment - ${selectedTax.type}` : 'Record Payment'}
        >
          {selectedTax && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!taxPaymentFormData.paymentDate || !taxPaymentFormData.amount) {
                  toast.error('Please fill all required fields');
                  return;
                }

                const paymentAmount = parseFloat(taxPaymentFormData.amount);
                if (isNaN(paymentAmount) || paymentAmount <= 0) {
                  toast.error('Please enter a valid amount');
                  return;
                }

                // Create new payment record
                const newPayment = {
                  id: Date.now().toString(),
                  taxType: selectedTax.type,
                  amount: paymentAmount,
                  paymentDate: new Date(taxPaymentFormData.paymentDate).toISOString(),
                  status: 'paid' as const,
                  notes: taxPaymentFormData.notes || undefined,
                };

                // Save to localStorage
                const currentPayments = loadTaxPayments();
                const updatedPayments = [newPayment, ...currentPayments];
                saveTaxPayments(updatedPayments);
                refreshTaxPayments();

                toast.success('Payment recorded successfully');
                setIsRecordPaymentModalOpen(false);
                setSelectedTax(null);
                setTaxPaymentFormData({ paymentDate: '', amount: '', notes: '' });

                // Refresh the page data
                await queryClient.invalidateQueries({ queryKey: ['hospital', 'billings', hospitalId, 'taxes'] });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                  Payment Date *
                </label>
                <DateTimePicker
                  type="date"
                  value={taxPaymentFormData.paymentDate}
                  onChange={(e) => setTaxPaymentFormData({ ...taxPaymentFormData, paymentDate: e.target.value })}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                  Amount *
                </label>
                <TextField
                  type="number"
                  step="0.01"
                  value={taxPaymentFormData.amount}
                  onChange={(e) => setTaxPaymentFormData({ ...taxPaymentFormData, amount: e.target.value })}
                  required
                  placeholder="0.00"
                  className="h-12"
                />
                <p className="text-xs text-subtle-light dark:text-subtle-dark mt-1">
                  Tax amount: {formatCurrency(selectedTax.amount)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={taxPaymentFormData.notes}
                  onChange={(e) => setTaxPaymentFormData({ ...taxPaymentFormData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add any notes about this payment..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsRecordPaymentModalOpen(false);
                    setSelectedTax(null);
                    setTaxPaymentFormData({ paymentDate: '', amount: '', notes: '' });
                  }}
                  className="px-4 py-2 rounded-lg font-medium border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Record Payment
                </button>
              </div>
            </form>
          )}
        </Modal>

        {/* Add New Tax Modal */}
        <Modal
          isOpen={isAddTaxModalOpen}
          onClose={() => {
            setIsAddTaxModalOpen(false);
            setNewTaxFormData({ name: '', purpose: '', amount: '', paymentFrequency: 'annual', dueDate: '' });
          }}
          title="Add New Tax"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!newTaxFormData.name || !newTaxFormData.amount || !newTaxFormData.dueDate) {
                toast.error('Please fill all required fields');
                return;
              }

              const taxAmount = parseFloat(newTaxFormData.amount);
              if (isNaN(taxAmount) || taxAmount <= 0) {
                toast.error('Please enter a valid amount');
                return;
              }

              // Add new tax to current taxes
              const currentTaxesData = loadTaxes();
              const taxKey = newTaxFormData.name.toLowerCase().replace(/\s+/g, '') + 'Tax';
              const updatedTaxes = {
                ...currentTaxesData,
                [taxKey]: taxAmount,
              };
              console.log('[Add Tax] Saving new tax:', { taxKey, taxAmount, updatedTaxes });
              saveTaxes(updatedTaxes);

              // Also save tax metadata (name, purpose, frequency, dueDate) for display
              try {
                const taxMetadata = JSON.parse(localStorage.getItem('hospital-admin-tax-metadata') || '{}');
                taxMetadata[newTaxFormData.name] = {
                  purpose: newTaxFormData.purpose,
                  paymentFrequency: newTaxFormData.paymentFrequency,
                  dueDate: newTaxFormData.dueDate,
                };
                localStorage.setItem('hospital-admin-tax-metadata', JSON.stringify(taxMetadata));
              } catch (err) {
                console.error('Error saving tax metadata:', err);
              }

              toast.success(`${newTaxFormData.name} added successfully`);
              setIsAddTaxModalOpen(false);
              setNewTaxFormData({ name: '', purpose: '', amount: '', paymentFrequency: 'annual', dueDate: '' });

              // Refresh the page data
              await queryClient.invalidateQueries({ queryKey: ['hospital', 'billings', hospitalId] });
              
              // Force a re-render by updating the query - navigate to taxes tab if not already there
              if (activeTab !== 'taxes') {
                setActiveTab('taxes');
              } else {
                // If already on taxes tab, just refetch
                await queryClient.refetchQueries({ queryKey: ['hospital', 'billings', hospitalId, 'taxes'] });
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                Tax Name *
              </label>
              <TextField
                value={newTaxFormData.name}
                onChange={(e) => setNewTaxFormData({ ...newTaxFormData, name: e.target.value })}
                required
                placeholder="e.g., Sales Tax, VAT"
                className="h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                Purpose/Description
              </label>
              <textarea
                value={newTaxFormData.purpose}
                onChange={(e) => setNewTaxFormData({ ...newTaxFormData, purpose: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe the purpose of this tax..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                  Amount *
                </label>
                <TextField
                  type="number"
                  step="0.01"
                  value={newTaxFormData.amount}
                  onChange={(e) => setNewTaxFormData({ ...newTaxFormData, amount: e.target.value })}
                  required
                  placeholder="0.00"
                  className="h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                  Payment Frequency *
                </label>
                <Select
                  value={newTaxFormData.paymentFrequency}
                  onChange={(e) => setNewTaxFormData({ ...newTaxFormData, paymentFrequency: e.target.value })}
                  options={[
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'quarterly', label: 'Quarterly' },
                    { value: 'semi-annual', label: 'Semi-Annual' },
                    { value: 'annual', label: 'Annual' },
                  ]}
                  className="h-12"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                Due Date *
              </label>
              <DateTimePicker
                type="date"
                value={newTaxFormData.dueDate}
                onChange={(e) => setNewTaxFormData({ ...newTaxFormData, dueDate: e.target.value })}
                required
                min={new Date().toISOString().split('T')[0]}
                className="h-12"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsAddTaxModalOpen(false);
                  setNewTaxFormData({ name: '', purpose: '', amount: '', paymentFrequency: 'annual', dueDate: '' });
                }}
                className="px-4 py-2 rounded-lg font-medium border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Add Tax
              </button>
            </div>
          </form>
        </Modal>

        {/* Add Bill/Expense Modal */}
        <Modal
          isOpen={isAddBillModalOpen}
          onClose={() => {
            setIsAddBillModalOpen(false);
            setBillFormData({
              vendor: '',
              description: '',
              amount: '',
              category: '',
              due_date: '',
            });
          }}
          title="Add Bill/Expense"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!billFormData.vendor || !billFormData.description || !billFormData.amount || !billFormData.category || !billFormData.due_date) {
                toast.error('Please fill all required fields');
                return;
              }
              
              // Create new bill (always pending by default)
              const newBill = {
                id: Date.now(),
                vendor: billFormData.vendor,
                description: billFormData.description,
                amount: parseFloat(billFormData.amount),
                status: 'pending' as const,
                category: billFormData.category,
                due_date: new Date(billFormData.due_date).toISOString(),
              };
              
              // Save to localStorage for persistence
              try {
                const stored = localStorage.getItem('hospital-admin-accounts-payable');
                const existingBills = stored ? JSON.parse(stored) : [];
                const updatedBills = [...existingBills, newBill];
                localStorage.setItem('hospital-admin-accounts-payable', JSON.stringify(updatedBills));
              } catch (err) {
                console.error('Error saving bill to localStorage:', err);
                toast.error('Failed to save bill. Please try again.');
                return;
              }
              
              // Invalidate queries to refetch with new data
              await queryClient.invalidateQueries({ queryKey: ['hospital', 'billings', hospitalId, 'accounts-payable'] });
              await queryClient.refetchQueries({ queryKey: ['hospital', 'billings', hospitalId, 'accounts-payable'] });
              
              toast.success('Bill/Expense added successfully');
              setIsAddBillModalOpen(false);
              setBillFormData({
                vendor: '',
                description: '',
                amount: '',
                category: '',
                due_date: '',
              });
            }}
            className="space-y-4"
          >
            <TextField
              label="Vendor/Supplier"
              value={billFormData.vendor}
              onChange={(e) => setBillFormData({ ...billFormData, vendor: e.target.value })}
              required
              placeholder="e.g., MedSupply Co."
            />

            <TextField
              label="Description"
              value={billFormData.description}
              onChange={(e) => setBillFormData({ ...billFormData, description: e.target.value })}
              required
              placeholder="e.g., Medical Supplies"
            />

            <div className="grid grid-cols-2 gap-4">
              <TextField
                label="Amount"
                type="number"
                step="0.01"
                value={billFormData.amount}
                onChange={(e) => setBillFormData({ ...billFormData, amount: e.target.value })}
                required
                placeholder="0.00"
              />

              <Select
                label="Category"
                value={billFormData.category}
                onChange={(e) => setBillFormData({ ...billFormData, category: e.target.value })}
                required
                options={[
                  { value: '', label: 'Select category' },
                  { value: 'Supplies', label: 'Supplies' },
                  { value: 'Maintenance', label: 'Maintenance' },
                  { value: 'Utilities', label: 'Utilities' },
                  { value: 'Insurance', label: 'Insurance' },
                  { value: 'Other', label: 'Other' },
                ]}
              />
            </div>

            <DateTimePicker
              label="Due Date"
              type="date"
              value={billFormData.due_date}
              onChange={(e) => setBillFormData({ ...billFormData, due_date: e.target.value })}
              required
              min={new Date().toISOString().split('T')[0]}
            />

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsAddBillModalOpen(false);
                  setBillFormData({
                    vendor: '',
                    description: '',
                    amount: '',
                    category: '',
                    due_date: '',
                  });
                }}
                className="h-11 px-6 rounded-lg font-semibold bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-11 px-6 rounded-lg font-semibold bg-primary text-white shadow-soft hover:bg-primary/90 transition-colors"
              >
                Add Bill/Expense
              </button>
            </div>
          </form>
        </Modal>

        {/* Add Receivable Modal */}
        <Modal
          isOpen={isAddReceivableModalOpen}
          onClose={() => {
            setIsAddReceivableModalOpen(false);
            setReceivableFormData({
              patient_name: '',
              invoice_number: '',
              service_rendered: '',
              amount_due: '',
              due_date: '',
            });
          }}
          title="Add Receivable"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!receivableFormData.patient_name || !receivableFormData.invoice_number || !receivableFormData.service_rendered || !receivableFormData.amount_due || !receivableFormData.due_date) {
                toast.error('Please fill all required fields');
                return;
              }
              
              // Determine status based on due date
              const dueDate = new Date(receivableFormData.due_date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              dueDate.setHours(0, 0, 0, 0);
              
              let status: 'pending' | 'paid' | 'overdue' | 'collection' = 'pending';
              if (dueDate < today) {
                const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                status = daysOverdue > 90 ? 'collection' : 'overdue';
              }
              
              // Create new receivable
              const newReceivable = {
                id: Date.now(),
                patient_name: receivableFormData.patient_name,
                invoice_number: receivableFormData.invoice_number,
                service_rendered: receivableFormData.service_rendered,
                amount_due: parseFloat(receivableFormData.amount_due),
                due_date: new Date(receivableFormData.due_date).toISOString(),
                status: status,
              };
              
              // Save to localStorage for persistence
              try {
                const stored = localStorage.getItem('hospital-admin-accounts-receivable');
                const existingReceivables = stored ? JSON.parse(stored) : [];
                const updatedReceivables = [...existingReceivables, newReceivable];
                localStorage.setItem('hospital-admin-accounts-receivable', JSON.stringify(updatedReceivables));
              } catch (err) {
                console.error('Error saving receivable to localStorage:', err);
                toast.error('Failed to save receivable. Please try again.');
                return;
              }
              
              // Invalidate queries to refetch with new data
              await queryClient.invalidateQueries({ queryKey: ['hospital', 'billings', hospitalId, 'accounts-receivable'] });
              await queryClient.refetchQueries({ queryKey: ['hospital', 'billings', hospitalId, 'accounts-receivable'] });
              
              toast.success('Receivable added successfully');
              setIsAddReceivableModalOpen(false);
              setReceivableFormData({
                patient_name: '',
                invoice_number: '',
                service_rendered: '',
                amount_due: '',
                due_date: '',
              });
            }}
            className="space-y-4"
          >
            <TextField
              label="Patient/Payer Name"
              value={receivableFormData.patient_name}
              onChange={(e) => setReceivableFormData({ ...receivableFormData, patient_name: e.target.value })}
              required
              placeholder="e.g., John Doe"
            />

            <TextField
              label="Invoice Number"
              value={receivableFormData.invoice_number}
              onChange={(e) => setReceivableFormData({ ...receivableFormData, invoice_number: e.target.value })}
              required
              placeholder="e.g., INV-2024-001"
            />

            <TextField
              label="Service Rendered"
              value={receivableFormData.service_rendered}
              onChange={(e) => setReceivableFormData({ ...receivableFormData, service_rendered: e.target.value })}
              required
              placeholder="e.g., Consultation"
            />

            <div className="grid grid-cols-2 gap-4">
              <TextField
                label="Amount Due"
                type="number"
                step="0.01"
                value={receivableFormData.amount_due}
                onChange={(e) => setReceivableFormData({ ...receivableFormData, amount_due: e.target.value })}
                required
                placeholder="0.00"
              />

              <DateTimePicker
                label="Due Date"
                type="date"
                value={receivableFormData.due_date}
                onChange={(e) => setReceivableFormData({ ...receivableFormData, due_date: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsAddReceivableModalOpen(false);
                  setReceivableFormData({
                    patient_name: '',
                    invoice_number: '',
                    service_rendered: '',
                    amount_due: '',
                    due_date: '',
                  });
                }}
                className="h-11 px-6 rounded-lg font-semibold bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-11 px-6 rounded-lg font-semibold bg-primary text-white shadow-soft hover:bg-primary/90 transition-colors"
              >
                Add Receivable
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
};

export default Billings;
