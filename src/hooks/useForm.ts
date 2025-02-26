import { useState } from 'react';

interface FormValues {
    [key: string]: string;
}

interface FormErrors {
    [key: string]: string;
}

interface UseFormProps {
    initialValues: FormValues;
    validate: (values: FormValues) => FormErrors;
}

function useForm({ initialValues, validate }: UseFormProps) {
    const [values, setValues] = useState<FormValues>(initialValues);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setValues({
            ...values,
            [name]: value,
        });
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrors(validate(values));
        setIsSubmitting(true);
    };

    const resetForm = () => {
        setValues(initialValues);
        setErrors({});
        setIsSubmitting(false);
    };

    return {
        handleChange,
        handleSubmit,
        values,
        errors,
        isSubmitting,
        resetForm
    };
}

export default useForm;