import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function useQueryParameters() {
    const location = useLocation();
    const navigate = useNavigate();

    const queryParams = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return Object.fromEntries(params.entries());
    }, [location.search]);

    const setQueryParams = (newParams) => {
        const params = new URLSearchParams({ ...queryParams, ...newParams });
        navigate(`${location.pathname}?${params.toString()}`);
    };

    return { queryParams, setQueryParams };
}

export default useQueryParameters;