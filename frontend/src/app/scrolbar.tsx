<style>{`
    /* Default state: Scrollbar takes up space but is invisible */
    .custom-scrollbar::-webkit-scrollbar { 
        width: 5px; 
        height: 5px; 
    }
    .custom-scrollbar::-webkit-scrollbar-track { 
        background: transparent; 
        margin: 4px; 
    }
    .custom-scrollbar::-webkit-scrollbar-thumb { 
        background: transparent; /* Hidden by default */
        border-radius: 20px; 
    }

    /* Show the scrollbar when hovering over the CONTAINER */
    .custom-scrollbar:hover::-webkit-scrollbar-thumb { 
        background: #c7eaff; 
    }

    /* Darker color when hovering over the SCROLLBAR itself */
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
        background: #00A3FF; 
    }

    /* Firefox Support */
    .custom-scrollbar { 
        scrollbar-width: thin; 
        scrollbar-color: transparent transparent; /* Hidden */
    }
    .custom-scrollbar:hover { 
        scrollbar-color: #c7eaff transparent; /* Visible on hover */
    }
`}</style>