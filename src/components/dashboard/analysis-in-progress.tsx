import React from 'react';
import { PageContentLayout } from '../layout/page-content-layout';

export const AnalysisInProgressScreen = () => {
    return (
        <PageContentLayout>
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/20 py-20 text-center">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent" />
                <p className="text-lg font-semibold">Please wait while we analyze your data.</p>
                <p className="text-muted-foreground">This may take a few moments depending on the size of your file.</p>
            </div>
        </PageContentLayout>
    );
}; 