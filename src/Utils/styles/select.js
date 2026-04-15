export const select = {
    control: (provided, state) => ({
        ...provided,
        color: '#334155',
        backgroundColor: '#FCFCFC',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: 'none',
        minHeight: '42px',
        "&:hover": {
            borderColor: '#7fd3ab',
            boxShadow: '0 0 0 4px rgba(127,211,171,0.15)'
        }
    }),
    dropdownIndicator: (provided, state) => ({
        ...provided,
        color: '#7fd3ab',
        backgroundColor: '#F1F5F9',
        borderRadius: '0 16px 16px 0'
    }),
    indicatorsContainer: (provided, state) => ({
        ...provided,
        color: '#64748B',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '16px'
    }),
    indicatorSeparator: (provided, state) => ({
        ...provided,
        backgroundColor: '#E2E8F0',
    }),
    input: (provided, state) => ({
        ...provided,
        color: '#334155',
        border: 'none',
    }),
    loadingIndicator: (provided, state) => ({
        ...provided,
        color: '#7fd3ab',
    }),
    loadingMessage: (provided, state) => ({
        ...provided,
        color: '#64748B',
        backgroundColor: '#FFFFFF',
    }),
    menu: (provided, state) => ({
        ...provided,
        color: '#334155',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        zIndex: 999999,
        boxShadow: '0 20px 60px rgba(15,23,42,0.08)',
        overflow: 'hidden',
    }),
    menuList: (provided, state) => ({
        ...provided,
        color: '#334155',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '4px',
    }),
    menuPortal: (provided, state) => ({
        ...provided,
        zIndex: 999999,
    }),
    noOptionsMessage: (provided, state) => ({
        ...provided,
        color: '#94A3B8',
        backgroundColor: '#FFFFFF',
    }),
    option: (provided, state) => ({
        ...provided,
        color: state.isSelected ? '#FFFFFF' : '#334155',
        backgroundColor: state.isSelected ? '#7fd3ab' : state.isFocused ? '#F1F5F9' : '#FFFFFF',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
    }),
    valueContainer: (provided, state) => ({
        ...provided,
        color: '#334155',
    }),
    singleValue: (provided, state) => ({
        ...provided,
        color: '#334155',
    }),
}
