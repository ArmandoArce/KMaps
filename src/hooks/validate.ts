interface FormValues {
    name: string;
    latitude: string;
    longitude: string;
}
interface FormErrors {
    name?: string;
    latitude?: string;
    longitude?: string;
}
function validate(values: FormValues): FormErrors {
    let errors: FormErrors = {};
    if (!values.name) {
        errors.name = 'Name is required';
    }
    if (!values.latitude) {
        errors.latitude = 'Latitude is required';
    } else if (isNaN(Number(values.latitude))) {
        errors.latitude = 'Latitude must be a number';
    }
    if (!values.longitude) {
        errors.longitude = 'Longitude is required';
    } else if (isNaN(Number(values.longitude))) {
        errors.longitude = 'Longitude must be a number';
    }
    return errors;
}
export default validate; 