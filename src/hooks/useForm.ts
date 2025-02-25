import { useState } from 'react';

function useForm(initialValues, validate) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setValues({
            ...values,
            [name]: value,
        });
    };

    const handleSubmit = (event) => {
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