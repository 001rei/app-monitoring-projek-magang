// components/ProgressBar.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({ showSpinner: false }); // Sembunyikan spinner (opsional)

const ProgressBar = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const handleStart = () => NProgress.start(); // Mulai loading bar saat rute berubah
        const handleComplete = () => NProgress.done(); // Selesai loading bar setelah halaman dimuat

        // Mulai loading bar saat pathname atau searchParams berubah
        handleStart();

        // Fallback: Hentikan loading bar setelah beberapa waktu
        const timeout = setTimeout(() => {
            handleComplete();
        }, 1000); // Sesuaikan timeout sesuai kebutuhan

        // Hentikan loading bar saat komponen di-unmount
        return () => {
            clearTimeout(timeout);
            handleComplete();
        };
    }, [pathname, searchParams]);

    return null; // Komponen ini tidak merender apa pun ke UI
};

export default ProgressBar;