export const MonacoEnvironment = {
    getWorkerUrl(moduleId, label) {
        if (label === 'json') {
            return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker', import.meta.url));
        }
        if (['css', 'scss', 'less'].includes(label)) {
            return new Worker(new URL('monaco-editor/esm/vs/language/css/css.worker', import.meta.url));
        }
        if (label === 'html') {
            return new Worker(new URL('monaco-editor/esm/vs/language/html/html.worker', import.meta.url));
        }
        if (['typescript', 'javascript'].includes(label)) {
            return new Worker(new URL('monaco-editor/esm/vs/language/typescript/ts.worker', import.meta.url));
        }
        return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url));
    },
};