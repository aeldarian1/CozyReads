import { useState, useCallback, FormEvent, ChangeEvent } from 'react';
import { z } from 'zod';

export interface UseFormOptions<T> {
  initialValues: T;
  schema?: z.ZodSchema<T>;
  onSubmit: (values: T) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldTouched: (field: keyof T, touched: boolean) => void;
  setFieldError: (field: keyof T, error: string) => void;
  handleChange: (field: keyof T) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  resetForm: () => void;
  setValues: (values: Partial<T>) => void;
  validateField: (field: keyof T) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
}

/**
 * Powerful form management hook with built-in validation, error handling, and state management.
 *
 * @example
 * const form = useForm({
 *   initialValues: { title: '', author: '' },
 *   schema: bookSchema,
 *   onSubmit: async (values) => {
 *     await createBook(values);
 *   },
 * });
 *
 * <input
 *   value={form.values.title}
 *   onChange={form.handleChange('title')}
 *   onBlur={form.handleBlur('title')}
 * />
 * {form.errors.title && form.touched.title && <span>{form.errors.title}</span>}
 */
export function useForm<T extends Record<string, any>>({
  initialValues,
  schema,
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate a single field
  const validateField = useCallback(
    async (field: keyof T): Promise<boolean> => {
      if (!schema) return true;

      try {
        // Validate the entire form, but only check for this field's errors
        await schema.parseAsync(values);

        // Clear error if validation passes
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Only set error for the specific field being validated
          const fieldIssue = error.issues.find((issue) => issue.path[0] === field);
          if (fieldIssue) {
            setErrors((prev) => ({
              ...prev,
              [field]: fieldIssue.message,
            }));
            return false;
          } else {
            // Clear error for this field if no issue found
            setErrors((prev) => {
              const next = { ...prev };
              delete next[field];
              return next;
            });
            return true;
          }
        }
        return false;
      }
    },
    [schema, values]
  );

  // Validate entire form
  const validateForm = useCallback(async (): Promise<boolean> => {
    if (!schema) return true;

    try {
      await schema.parseAsync(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof T, string>> = {};
        error.issues.forEach((issue) => {
          const field = issue.path[0] as keyof T;
          if (field && !newErrors[field]) {
            newErrors[field] = issue.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [schema, values]);

  // Set a single field value
  const setFieldValue = useCallback(
    (field: keyof T, value: any) => {
      setValuesState((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Validate on change if enabled
      if (validateOnChange && touched[field]) {
        setTimeout(() => validateField(field), 0);
      }
    },
    [validateOnChange, touched, validateField]
  );

  // Set multiple values at once
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({
      ...prev,
      ...newValues,
    }));
  }, []);

  // Mark a field as touched
  const setFieldTouched = useCallback((field: keyof T, isTouched: boolean) => {
    setTouched((prev) => ({
      ...prev,
      [field]: isTouched,
    }));
  }, []);

  // Set a field error manually
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  // Handle input change events
  const handleChange = useCallback(
    (field: keyof T) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.value;

      setFieldValue(field, value);
    },
    [setFieldValue]
  );

  // Handle input blur events
  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setFieldTouched(field, true);

      // Validate on blur if enabled
      if (validateOnBlur) {
        validateField(field);
      }
    },
    [setFieldTouched, validateOnBlur, validateField]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key as keyof T] = true;
        return acc;
      }, {} as Record<keyof T, boolean>);
      setTouched(allTouched);

      // Validate form
      const isValid = await validateForm();
      if (!isValid) {
        return;
      }

      // Submit
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, onSubmit]
  );

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Check if form is valid (no errors)
  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
    validateField,
    validateForm,
  };
}
