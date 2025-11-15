import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';
import clsx from 'clsx';
import AppShell from '../../components/layout/AppShell';
import { HospitalAPI, Template } from '../../api/endpoints';
import { useAuth } from '../../store/auth';
import { useHospital } from '../../hooks/useHospital';
import Modal from '../../components/modals/Modal';
import TextField from '../../components/forms/TextField';
import Select from '../../components/forms/Select';
import PasswordField from '../../components/forms/PasswordField';
import DataTable from '../../components/tables/DataTable';
import Spinner from '../../components/feedback/Spinner';

type CustomVariable = {
  id: string;
  variable: string;
  description: string;
};

/**
 * Templates Page
 * 
 * Features:
 * - Table: Name, Channel (email/sms/voice), Active?, Updated
 * - Create Template button → modal with 2-column layout
 * - Form: name*, channel* (select), subject (email only), body_text*
 * - Drag-and-drop variables
 * - Custom variable creation
 * - Preview section showing rendered template with sample data
 * - Toggle active/inactive
 * - Delete with password confirmation
 */
const Templates = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const hospitalId = user?.hospital_id || '1';
  const { hospitalName } = useHospital();

  // State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    channel: 'email' as 'email' | 'sms' | 'voice',
    subject: '',
    body_text: '',
    is_active: true,
  });
  const [customVariables, setCustomVariables] = useState<CustomVariable[]>([]);
  const [isCreatingVariable, setIsCreatingVariable] = useState(false);
  const [newVariable, setNewVariable] = useState({ variable: '', description: '' });
  const [draggedVariable, setDraggedVariable] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ template: Template | null; password: string }>({
    template: null,
    password: '',
  });
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const subjectInputRef = useRef<HTMLInputElement>(null);

  // Default template variables
  const defaultVariables = [
    { variable: '{{patient_first}}', description: "Patient's first name" },
    { variable: '{{patient_last}}', description: "Patient's last name" },
    { variable: '{{clinician_name}}', description: "Assigned clinician's name" },
    { variable: '{{start_time_local}}', description: 'Appointment date and time (local timezone)' },
    { variable: '{{hospital_name}}', description: 'Hospital name' },
  ];

  // All variables (default + custom)
  const allVariables = useMemo(() => [...defaultVariables, ...customVariables], [customVariables]);

  // Sample data for preview
  const previewData = useMemo(() => {
    const base = {
      patient_first: 'Sarah',
      patient_last: 'Johnson',
      clinician_name: 'Dr. Emily Carter',
      start_time_local: 'July 26th at 2:00 PM',
      hospital_name: hospitalName,
    };
    // Add custom variables to preview data
    const custom: Record<string, string> = {};
    customVariables.forEach((cv) => {
      const key = cv.variable.replace(/[{}]/g, '');
      custom[key] = `[Sample ${key}]`;
    });
    return { ...base, ...custom };
  }, [customVariables]);

  // Fetch templates
  const { data: templates = [], isLoading, error } = useQuery<Template[]>({
    queryKey: ['hospital', 'templates', hospitalId],
    queryFn: async () => {
      try {
        const result = await HospitalAPI.listTemplates(hospitalId);
        return Array.isArray(result) ? result : [];
      } catch (err) {
        console.error('Error fetching templates:', err);
        return [];
      }
    },
  });

  // Create template mutation
  const createMutation = useMutation({
    mutationFn: (payload: any) => HospitalAPI.createTemplate(hospitalId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['hospital', 'templates'], exact: false });
      toast.success('Template created successfully');
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create template');
    },
  });

  // Update template mutation
  const updateMutation = useMutation({
    mutationFn: (payload: any) => {
      if (!editingTemplate) throw new Error('No template selected for editing');
      return HospitalAPI.updateTemplate(hospitalId, editingTemplate.id.toString(), payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['hospital', 'templates'], exact: false });
      toast.success('Template updated successfully');
      setEditingTemplate(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update template');
    },
  });

  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: (templateId: string) => HospitalAPI.deleteTemplate(hospitalId, templateId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['hospital', 'templates'], exact: false });
      toast.success('Template deleted successfully');
      setDeleteConfirm({ template: null, password: '' });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete template');
    },
  });

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: (template: Template) => {
      return HospitalAPI.updateTemplate(hospitalId, template.id.toString(), {
        is_active: !template.is_active,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['hospital', 'templates'], exact: false });
      toast.success('Template status updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update template status');
    },
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      channel: 'email',
      subject: '',
      body_text: '',
      is_active: true,
    });
    setCustomVariables([]);
    setIsCreatingVariable(false);
    setNewVariable({ variable: '', description: '' });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Template name is required');
      return;
    }

    if (!formData.body_text.trim()) {
      toast.error('Template body is required');
      return;
    }

    if (editingTemplate) {
      updateMutation.mutate({
        name: formData.name.trim(),
        channel: formData.channel,
        subject: formData.channel === 'email' ? formData.subject.trim() : undefined,
        body_text: formData.body_text.trim(),
        is_active: formData.is_active,
      });
    } else {
      createMutation.mutate({
        name: formData.name.trim(),
        channel: formData.channel,
        subject: formData.channel === 'email' ? formData.subject.trim() : undefined,
        body_text: formData.body_text.trim(),
        is_active: formData.is_active,
      });
    }
  };

  // Handle edit
  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      channel: template.channel,
      subject: template.subject || '',
      body_text: template.body_text,
      is_active: template.is_active,
    });
    setIsCreateModalOpen(true);
  };

  // Handle delete
  const handleDelete = (template: Template, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm({ template, password: '' });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (!deleteConfirm.template) return;
    
    // Mock password validation (use "password" as the mock password)
    if (deleteConfirm.password !== 'password') {
      toast.error('Incorrect password. Please try again.');
      return;
    }

    deleteMutation.mutate(deleteConfirm.template.id.toString());
  };

  // Handle toggle active
  const handleToggleActive = (template: Template, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleActiveMutation.mutate(template);
  };

  // Handle drag start
  const handleDragStart = (variable: string) => {
    setDraggedVariable(variable);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedVariable(null);
  };

  // Handle drop on textarea
  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>, target: 'body' | 'subject') => {
    e.preventDefault();
    const variable = draggedVariable;
    if (!variable) return;

    const textarea = target === 'body' ? bodyTextareaRef.current : subjectInputRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = target === 'body' ? formData.body_text : formData.subject;
    const newText = text.substring(0, start) + variable + text.substring(end);

    if (target === 'body') {
      setFormData({ ...formData, body_text: newText });
    } else {
      setFormData({ ...formData, subject: newText });
    }

    // Set cursor position after the inserted variable
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + variable.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);

    setDraggedVariable(null);
  };

  // Handle click on variable (insert at cursor)
  const handleVariableClick = (variable: string, target: 'body' | 'subject') => {
    const textarea = target === 'body' ? bodyTextareaRef.current : subjectInputRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = target === 'body' ? formData.body_text : formData.subject;
    const newText = text.substring(0, start) + variable + text.substring(end);

    if (target === 'body') {
      setFormData({ ...formData, body_text: newText });
    } else {
      setFormData({ ...formData, subject: newText });
    }

    // Set cursor position after the inserted variable
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + variable.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  // Handle create custom variable
  const handleCreateVariable = () => {
    if (!newVariable.variable.trim() || !newVariable.description.trim()) {
      toast.error('Variable name and description are required');
      return;
    }

    // Validate variable format (should be {{variable_name}})
    const variableFormat = /^{{[\w_]+}}$/;
    if (!variableFormat.test(newVariable.variable)) {
      toast.error('Variable must be in format {{variable_name}} (e.g., {{custom_field}})');
      return;
    }

    // Check if variable already exists
    if (allVariables.some((v) => v.variable === newVariable.variable)) {
      toast.error('Variable already exists');
      return;
    }

    setCustomVariables([
      ...customVariables,
      {
        id: Date.now().toString(),
        variable: newVariable.variable,
        description: newVariable.description,
      },
    ]);
    setNewVariable({ variable: '', description: '' });
    setIsCreatingVariable(false);
    toast.success('Custom variable created');
  };

  // Render preview
  const renderPreview = () => {
    let preview = formData.body_text;
    let subjectPreview = formData.channel === 'email' ? formData.subject : '';

    // Replace all variables with sample data
    Object.entries(previewData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      preview = preview.replace(regex, value);
      if (subjectPreview) {
        subjectPreview = subjectPreview.replace(regex, value);
      }
    });

    return { preview, subjectPreview };
  };

  // Table columns
  const columns: ColumnDef<Template>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <span className="font-semibold text-foreground-light dark:text-foreground-dark">
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: 'channel',
        header: 'Channel',
        cell: ({ row }) => {
          const channel = row.original.channel;
          const channelColors: Record<string, string> = {
            email: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
            sms: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
            voice: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          };
          return (
            <span
              className={clsx(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
                channelColors[channel] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              )}
            >
              {channel.toUpperCase()}
            </span>
          );
        },
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => {
          const isActive = row.original.is_active;
          return (
            <button
              onClick={(e) => handleToggleActive(row.original, e)}
              disabled={toggleActiveMutation.isPending}
              className={clsx(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                isActive
                  ? 'bg-primary'
                  : 'bg-gray-200 dark:bg-gray-700',
                toggleActiveMutation.isPending && 'opacity-50 cursor-not-allowed'
              )}
            >
              <span
                className={clsx(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  isActive ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          );
        },
      },
      {
        accessorKey: 'updated_at',
        header: 'Last Updated',
        cell: ({ row }) => (
          <span className="text-sm text-subtle-light dark:text-subtle-dark">
            {new Date(row.original.updated_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(row.original);
              }}
              className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
            >
              Edit
            </button>
            <button
              onClick={(e) => handleDelete(row.original, e)}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium text-sm transition-colors"
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    [toggleActiveMutation.isPending]
  );

  const { preview, subjectPreview } = renderPreview();
  const modalTitle = editingTemplate ? `Edit ${editingTemplate.name}` : 'Create New Template';

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground-light dark:text-foreground-dark">
              Templates
            </h1>
            <p className="text-subtle-light dark:text-subtle-dark mt-1">
              Manage communication templates for appointments and notifications
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingTemplate(null);
              setIsCreateModalOpen(true);
            }}
            className="h-11 px-4 rounded-lg font-semibold bg-primary text-white shadow-soft hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Create Template</span>
          </button>
        </div>

        {/* Table */}
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-300">
              Error loading templates. Please try refreshing the page.
            </p>
          </div>
        ) : (
          <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-soft overflow-hidden">
            <DataTable
              data={templates}
              columns={columns}
              isLoading={isLoading}
              emptyMessage="No templates found"
              emptyIcon="description"
            />
          </div>
        )}

        {/* Create/Edit Template Modal - 2 Column Layout */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingTemplate(null);
            resetForm();
          }}
          title={modalTitle}
          size="xl"
        >
          <form onSubmit={handleSubmit} className="h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Form */}
              <div className="space-y-4">
                {/* Template Name */}
                <TextField
                  label="Template Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Appointment Rem"
                  required
                />

                {/* Channel */}
                <Select
                  label="Channel"
                  value={formData.channel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      channel: e.target.value as 'email' | 'sms' | 'voice',
                      subject: formData.channel === 'email' ? formData.subject : '',
                    })
                  }
                  options={[
                    { value: 'email', label: 'Email' },
                    { value: 'sms', label: 'SMS' },
                    { value: 'voice', label: 'Voice' },
                  ]}
                  required
                />

                {/* Subject (Email/Voice only) */}
                {(formData.channel === 'email' || formData.channel === 'voice') && (
                  <div>
                    <label className="block text-sm font-medium text-subtle-light dark:text-subtle-dark mb-2">
                      Subject {formData.channel === 'email' ? '(Optional for Email/Voice)' : ''}
                    </label>
                    <input
                      ref={subjectInputRef}
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      onDrop={(e) => handleDrop(e, 'subject')}
                      onDragOver={(e) => e.preventDefault()}
                      placeholder="Enter subject"
                      className="w-full h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}

                {/* Body */}
                <div>
                  <label className="block text-sm font-medium text-subtle-light dark:text-subtle-dark mb-2">
                    Body <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    ref={bodyTextareaRef}
                    value={formData.body_text}
                    onChange={(e) => setFormData({ ...formData, body_text: e.target.value })}
                    onDrop={(e) => handleDrop(e, 'body')}
                    onDragOver={(e) => e.preventDefault()}
                    placeholder="Enter body content. Use variables from the helper below."
                    className="w-full min-h-[200px] px-4 py-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark placeholder-subtle-light dark:placeholder-subtle-dark focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    required
                  />
                </div>

                {/* Set as Active Toggle */}
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    <span className="ml-3 text-sm font-medium text-foreground-light dark:text-foreground-dark">
                      Set as Active
                    </span>
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border-light dark:border-border-dark">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setEditingTemplate(null);
                      resetForm();
                    }}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="h-11 px-6 rounded-lg font-semibold bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="h-11 px-6 rounded-lg font-semibold bg-primary text-white shadow-soft hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Spinner size="sm" />
                    )}
                    <span>Save Template</span>
                  </button>
                </div>
              </div>

              {/* Right Column - Variables Helper & Preview */}
              <div className="space-y-6">
                {/* Variables Helper */}
                <div className="bg-background-light dark:bg-background-dark/50 p-4 rounded-lg border border-border-light dark:border-border-dark">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-foreground-light dark:text-foreground-dark">
                      Variables Helper
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsCreatingVariable(!isCreatingVariable)}
                      className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      {isCreatingVariable ? 'Cancel' : '+ Create Variable'}
                    </button>
                  </div>

                  {/* Create Variable Form */}
                  {isCreatingVariable && (
                    <div className="mb-4 p-3 bg-card-light dark:bg-card-dark rounded border border-border-light dark:border-border-dark space-y-2">
                      <input
                        type="text"
                        value={newVariable.variable}
                        onChange={(e) => setNewVariable({ ...newVariable, variable: e.target.value })}
                        placeholder="Variable name (e.g., {{custom_field}})"
                        className="w-full h-9 px-3 rounded border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input
                        type="text"
                        value={newVariable.description}
                        onChange={(e) => setNewVariable({ ...newVariable, description: e.target.value })}
                        placeholder="Description"
                        className="w-full h-9 px-3 rounded border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={handleCreateVariable}
                        className="w-full h-8 px-3 rounded text-xs font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
                      >
                        Create
                      </button>
                    </div>
                  )}

                  {/* Variables List */}
                  <div className="space-y-2">
                    {allVariables.map((item) => (
                      <div
                        key={item.variable}
                        draggable
                        onDragStart={() => handleDragStart(item.variable)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleVariableClick(item.variable, 'body')}
                        className={clsx(
                          'flex items-center gap-2 p-2 rounded border cursor-move hover:bg-card-light dark:hover:bg-card-dark transition-colors',
                          draggedVariable === item.variable
                            ? 'border-primary bg-primary/10'
                            : 'border-border-light dark:border-border-dark'
                        )}
                      >
                        <span className="material-symbols-outlined text-sm text-subtle-light dark:text-subtle-dark">
                          drag_indicator
                        </span>
                        <code className="px-2 py-1 rounded bg-primary/10 text-primary font-mono text-xs flex-1">
                          {item.variable}
                        </code>
                        <span className="text-xs text-subtle-light dark:text-subtle-dark hidden sm:inline">
                          {item.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Preview */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800 relative overflow-hidden">
                  {/* Decorative envelope icon */}
                  <div className="absolute top-4 right-4 opacity-20">
                    <span className="material-symbols-outlined text-6xl text-orange-600 dark:text-orange-400">
                      mail
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-semibold text-foreground-light dark:text-foreground-dark mb-4 relative z-10">
                    Live Preview
                  </h4>
                  
                  <div className="bg-white dark:bg-card-dark p-4 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 relative z-10">
                    {formData.channel === 'email' && subjectPreview && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-foreground-light dark:text-foreground-dark mb-1">
                          Subject:
                        </p>
                        <p className="text-sm font-bold text-foreground-light dark:text-foreground-dark">
                          {subjectPreview}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-foreground-light dark:text-foreground-dark mb-1">
                        Body:
                      </p>
                      <p className="text-sm text-foreground-light dark:text-foreground-dark whitespace-pre-wrap">
                        {preview || (
                          <span className="text-subtle-light dark:text-subtle-dark italic">
                            Preview will appear here...
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteConfirm.template}
          onClose={() => setDeleteConfirm({ template: null, password: '' })}
          title="Confirm Delete"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-foreground-light dark:text-foreground-dark">
              Are you sure you want to delete the template{' '}
              <span className="font-semibold">"{deleteConfirm.template?.name}"</span>? This action
              cannot be undone.
            </p>
            <p className="text-sm text-subtle-light dark:text-subtle-dark">
              Please enter your password to confirm:
            </p>
            <PasswordField
              label="Password"
              value={deleteConfirm.password}
              onChange={(e) => setDeleteConfirm({ ...deleteConfirm, password: e.target.value })}
              placeholder="Enter your password"
              required
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-border-light dark:border-border-dark">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ template: null, password: '' })}
                disabled={deleteMutation.isPending}
                className="h-11 px-6 rounded-lg font-semibold bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending || !deleteConfirm.password}
                className="h-11 px-6 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleteMutation.isPending && <Spinner size="sm" />}
                <span>Delete Template</span>
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
};

export default Templates;
