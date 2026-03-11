import Swal from 'sweetalert2';

export const confirmDelete = (name: string) =>
    Swal.fire({
        title: 'Delete Confirmation',
        text: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
    });

export const confirmAction = (title: string, text: string, confirmText = 'Yes, proceed!') =>
    Swal.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: confirmText,
        cancelButtonText: 'Cancel',
        reverseButtons: true,
    });

export const showSuccess = (message: string) =>
    Swal.fire({
        icon: 'success',
        title: 'Success',
        text: message,
        timer: 2500,
        showConfirmButton: false,
        position: 'top-end',
        toast: true,
    });

export const showError = (message: string) =>
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        timer: 3500,
        showConfirmButton: false,
        position: 'top-end',
        toast: true,
    });
