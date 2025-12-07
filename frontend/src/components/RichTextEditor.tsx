import React, { useRef, useCallback, useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'direction', 'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
    const quillRef = useRef<ReactQuill>(null);

    // Custom image handler that prompts for URL instead of uploading
    const imageHandler = useCallback(() => {
        const url = prompt('Masukkan URL gambar:');
        if (url) {
            const quill = quillRef.current?.getEditor();
            if (quill) {
                const range = quill.getSelection(true);
                quill.insertEmbed(range.index, 'image', url);
                quill.setSelection(range.index + 1);
            }
        }
    }, []);

    // Custom video handler that prompts for URL
    const videoHandler = useCallback(() => {
        const url = prompt('Masukkan URL video (YouTube, Vimeo, dll):');
        if (url) {
            const quill = quillRef.current?.getEditor();
            if (quill) {
                const range = quill.getSelection(true);
                // Convert YouTube URL to embed format
                let embedUrl = url;
                if (url.includes('youtube.com/watch')) {
                    const videoId = url.split('v=')[1]?.split('&')[0];
                    if (videoId) {
                        embedUrl = `https://www.youtube.com/embed/${videoId}`;
                    }
                } else if (url.includes('youtu.be/')) {
                    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
                    if (videoId) {
                        embedUrl = `https://www.youtube.com/embed/${videoId}`;
                    }
                }
                quill.insertEmbed(range.index, 'video', embedUrl);
                quill.setSelection(range.index + 1);
            }
        }
    }, []);

    // Modules with custom handlers
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'font': [] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'script': 'sub' }, { 'script': 'super' }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'indent': '-1' }, { 'indent': '+1' }],
                [{ 'direction': 'rtl' }],
                [{ 'align': [] }],
                ['blockquote', 'code-block'],
                ['link', 'image', 'video'],
                ['clean']
            ],
            handlers: {
                image: imageHandler,
                video: videoHandler
            }
        },
        clipboard: {
            matchVisual: false
        }
    }), [imageHandler, videoHandler]);

    return (
        <div className="rich-text-editor">
            <style>{`
                .rich-text-editor .ql-container {
                    min-height: 250px;
                    font-size: 1rem;
                    font-family: inherit;
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                }
                .rich-text-editor .ql-toolbar {
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                    background: #f8fafc;
                    border-color: #e2e8f0;
                    flex-wrap: wrap;
                }
                .rich-text-editor .ql-container {
                    border-color: #e2e8f0;
                }
                .rich-text-editor .ql-editor {
                    min-height: 200px;
                    line-height: 1.8;
                }
                .rich-text-editor .ql-editor.ql-blank::before {
                    font-style: normal;
                    color: #94a3b8;
                }
                .rich-text-editor .ql-snow .ql-picker-label {
                    color: #475569;
                }
                .rich-text-editor .ql-snow .ql-stroke {
                    stroke: #475569;
                }
                .rich-text-editor .ql-snow .ql-fill {
                    fill: #475569;
                }
                .rich-text-editor .ql-snow .ql-picker.ql-expanded .ql-picker-label {
                    border-color: var(--primary);
                }
                .rich-text-editor .ql-snow .ql-picker.ql-expanded .ql-picker-options {
                    border-color: #e2e8f0;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                .rich-text-editor .ql-toolbar.ql-snow .ql-picker-label:hover,
                .rich-text-editor .ql-toolbar.ql-snow .ql-picker-item:hover,
                .rich-text-editor .ql-toolbar.ql-snow button:hover {
                    color: var(--primary);
                }
                .rich-text-editor .ql-toolbar.ql-snow button:hover .ql-stroke {
                    stroke: var(--primary);
                }
                .rich-text-editor .ql-toolbar.ql-snow button:hover .ql-fill {
                    fill: var(--primary);
                }
                .rich-text-editor .ql-toolbar.ql-snow button.ql-active {
                    color: var(--primary);
                }
                .rich-text-editor .ql-toolbar.ql-snow button.ql-active .ql-stroke {
                    stroke: var(--primary);
                }
                .rich-text-editor .ql-toolbar.ql-snow button.ql-active .ql-fill {
                    fill: var(--primary);
                }
                .rich-text-editor .ql-editor img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 0.5rem;
                }
                .rich-text-editor .ql-editor iframe {
                    max-width: 100%;
                    border-radius: 0.5rem;
                }
            `}</style>
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder || 'Tulis konten materi di sini...'}
            />
        </div>
    );
};
