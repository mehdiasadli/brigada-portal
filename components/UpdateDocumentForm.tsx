'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DocumentCategory, DocumentClassification, ContentStatus } from '@prisma/client';
import RichTextEditor from './RichTextEditor';
import {
  getDocumentCategoryDisplayName,
  getDocumentClassificationDisplayName,
  getDocumentStatusDisplayName,
} from '@/lib/utils';

interface Document {
  id: string;
  title: string;
  description: string | null;
  content: string;
  category: DocumentCategory;
  classification: DocumentClassification;
  status: ContentStatus;
  tags: string[] | null;
  slug: string;
  version: string | null;
  author: {
    id: string;
    name: string;
    roles: string[];
  };
}

interface UpdateDocumentFormProps {
  document: Document;
}

export default function UpdateDocumentForm({ document }: UpdateDocumentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [useRichEditor, setUseRichEditor] = useState(true);
  const [error, setError] = useState('');

  // Extract content from MDX on component mount
  const extractMDXContent = (mdxContent: string): string => {
    // Remove the import statement
    let content = mdxContent.replace(/^import.*from.*;\s*/m, '');

    // Remove the export metadata block
    content = content.replace(/^export const metadata = \{[\s\S]*?\};\s*/m, '');

    // Remove the opening MDXLayout tag and props
    content = content.replace(/<MDXLayout[\s\S]*?>\s*/m, '');

    // Remove the closing MDXLayout tag
    content = content.replace(/\s*<\/MDXLayout>\s*$/m, '');

    return content.trim();
  };

  const [formData, setFormData] = useState({
    title: document.title,
    description: document.description || '',
    content: extractMDXContent(document.content),
    category: document.category,
    classification: document.classification,
    status: document.status,
    tags: document.tags || [],
    version: document.version || '',
  });

  const [tagInput, setTagInput] = useState('');

  // Block background scrolling when modal is open
  useEffect(() => {
    if (isFullScreen) {
      globalThis.document.body.style.overflow = 'hidden';
    } else {
      globalThis.document.body.style.overflow = 'unset';
    }

    return () => {
      globalThis.document.body.style.overflow = 'unset';
    };
  }, [isFullScreen]);

  // Handle form input changes
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Handle tag operations
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Generate MDX content with proper wrapper
  const generateMDXFromContent = useCallback(
    (content: string) => {
      return `import { MDXLayout } from '@/components/MDXLayout';

export const metadata = {
  title: '${formData.title}',
};

<MDXLayout 
  title="${formData.title}"
  description="${formData.description}"
  date="${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}"
>

${content}

</MDXLayout>`;
    },
    [formData.title, formData.description]
  );

  // For raw MDX editing
  const finalMDXContent = useMemo(
    () => generateMDXFromContent(formData.content),
    [generateMDXFromContent, formData.content]
  );

  // Preview content with markdown conversion
  const previewContent = useMemo(() => {
    let html = formData.content;

    // Convert headers
    html = html.replace(/^#### (.*$)/gm, '<h4 class="text-base font-bold text-gray-900 font-serif mb-2 mt-3">$1</h4>');
    html = html.replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold text-gray-900 font-serif mb-2 mt-4">$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-gray-900 font-serif mb-3 mt-6">$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-gray-900 font-serif mb-4 mt-8">$1</h1>');

    // Convert bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
    html = html.replace(/_(.*?)_/g, '<em class="italic">$1</em>');

    // Convert underline and strikethrough
    html = html.replace(/<u>(.*?)<\/u>/g, '<span class="underline">$1</span>');
    html = html.replace(/~~(.*?)~~/g, '<span class="line-through">$1</span>');

    // Convert code
    html = html.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>');

    // Convert links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 underline">$1</a>');

    // Convert lists
    html = html.replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>');
    html = html.replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4">$1. $2</li>');

    // Convert quotes
    html = html.replace(
      /^> (.*$)/gm,
      '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-700">$1</blockquote>'
    );

    // Convert line breaks
    html = html.replace(/\n/g, '<br>');

    return html;
  }, [formData.content]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const mdxContent = generateMDXFromContent(formData.content);

      const response = await fetch(`/api/documents/${document.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          content: mdxContent,
          category: formData.category,
          classification: formData.classification,
          status: formData.status,
          tags: formData.tags.join(','),
          version: formData.version,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // If slug changed, redirect to new slug, otherwise stay on current slug
        const targetSlug = result.newSlug || document.slug;
        router.push(`/docs/${targetSlug}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update document');
      }
    } catch (error) {
      console.error('Update error:', error);
      setError('An error occurred while updating the document');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className='space-y-8'>
        {error && (
          <div className='bg-red-50 border border-red-200 rounded-md p-4'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div className='ml-3'>
                <p className='text-sm text-red-700 font-serif'>{error}</p>
              </div>
            </div>
          </div>
        )}
        {/* Document Information */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <h2 className='text-xl font-bold text-gray-900 font-serif mb-6'>Sənədin Məlumatları</h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label htmlFor='title' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                Sənədin Adı *
              </label>
              <input
                type='text'
                id='title'
                required
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className='w-full px-4 py-3 bg-white border border-gray-300 rounded-lg font-serif focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Sənədin adını daxil edin'
              />
            </div>

            <div>
              <label htmlFor='version' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                Versiya
              </label>
              <input
                type='text'
                id='version'
                value={formData.version}
                onChange={(e) => handleInputChange('version', e.target.value)}
                className='w-full px-4 py-3 bg-white border border-gray-300 rounded-lg font-serif focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='məsələn, 1.0, 2.1'
              />
            </div>

            <div className='md:col-span-2'>
              <label htmlFor='description' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                Təsvir *
              </label>
              <textarea
                id='description'
                required
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className='w-full px-4 py-3 bg-white border border-gray-300 rounded-lg font-serif focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical'
                placeholder='Sənədin təsvirini daxil edin'
              />
            </div>

            <div>
              <label htmlFor='category' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                Kateqoriya *
              </label>
              <select
                id='category'
                required
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className='w-full px-4 py-3 bg-white border border-gray-300 rounded-lg font-serif focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value=''>Kateqoriya seçin</option>
                <option value={DocumentCategory.CONSTITUTION}>Konstitusiya</option>
                <option value={DocumentCategory.LAW}>Qanun</option>
                <option value={DocumentCategory.CODE}>Məcəllə</option>
                <option value={DocumentCategory.DECREE}>Fərman</option>
                <option value={DocumentCategory.RESOLUTION}>Sərəncam</option>
                <option value={DocumentCategory.REGULATION}>Norma / Əmr</option>
                <option value={DocumentCategory.OTHER}>Digər</option>
              </select>
            </div>

            <div>
              <label htmlFor='classification' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                Klassifikasiya *
              </label>
              <select
                id='classification'
                required
                value={formData.classification}
                onChange={(e) => handleInputChange('classification', e.target.value)}
                className='w-full px-4 py-3 bg-white border border-gray-300 rounded-lg font-serif focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value=''>Klassifikasiya seçin</option>
                <option value={DocumentClassification.PUBLIC}>İctimai</option>
                <option value={DocumentClassification.INTERNAL}>Daxili</option>
                <option value={DocumentClassification.RESTRICTED}>Məhdudlaşdırılmış</option>
              </select>
            </div>

            <div>
              <label htmlFor='status' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                Status *
              </label>
              <select
                id='status'
                required
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className='w-full px-4 py-3 bg-white border border-gray-300 rounded-lg font-serif focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value={ContentStatus.DRAFT}>Qaralama</option>
                <option value={ContentStatus.PUBLISHED}>Yayımlanmış</option>
                <option value={ContentStatus.ARCHIVED}>Arxivlənmiş</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className='block text-sm font-medium text-gray-700 font-serif mb-2'>Taqlar</label>
              <div className='space-y-2'>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className='flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Taq daxil edin və Enter düyməsini basın'
                  />
                  <button
                    type='button'
                    onClick={handleAddTag}
                    className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-serif'
                  >
                    Əlavə et
                  </button>
                </div>

                {formData.tags.length > 0 && (
                  <div className='flex flex-wrap gap-2'>
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-serif flex items-center gap-1'
                      >
                        {tag}
                        <button
                          type='button'
                          onClick={() => handleRemoveTag(tag)}
                          className='text-blue-600 hover:text-blue-800'
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Document Content */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-bold text-gray-900 font-serif'>Sənədin Məzmunu</h2>
            <div className='flex gap-2'>
              <button
                type='button'
                onClick={() => setUseRichEditor(!useRichEditor)}
                className='text-sm text-blue-600 hover:text-blue-800 font-serif'
              >
                {useRichEditor ? 'Raw MDX' : 'Redaktor'}
              </button>
              <button
                type='button'
                onClick={() => setIsFullScreen(true)}
                className='px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-serif text-sm flex items-center gap-1'
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4'
                  />
                </svg>
                Tam Ekran
              </button>
            </div>
          </div>

          {useRichEditor ? (
            <RichTextEditor
              value={formData.content}
              onChange={(content) => handleInputChange('content', content)}
              placeholder='Sənədin məzmununu buraya yazın...'
            />
          ) : (
            <textarea
              required
              value={finalMDXContent}
              onChange={(e) => {
                // Extract content from MDX when editing raw
                const lines = e.target.value.split('\n');
                const contentStart = lines.findIndex((line) => line.trim() === '>');
                const contentEnd = lines.lastIndexOf('</MDXLayout>');
                if (contentStart !== -1 && contentEnd !== -1) {
                  const extractedContent = lines
                    .slice(contentStart + 1, contentEnd)
                    .join('\n')
                    .trim();
                  handleInputChange('content', extractedContent);
                }
              }}
              rows={25}
              className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md font-mono text-sm focus:ring-blue-500 focus:border-blue-500'
              placeholder='Tam MDX məzmunu...'
            />
          )}

          <p className='text-sm text-gray-600 font-serif mt-2'>
            {useRichEditor
              ? 'Formatlama üçün yuxarı toolbardan istifadə edin. Məzmununuz avtomatik olaraq MDX formatına çevriləcək.'
              : 'Direkt MDX redaktə - tam MDX fayl strukturunu dəyişin.'}
          </p>
        </div>

        {/* Document Summary and Preview */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Document Summary */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
            <h3 className='text-lg font-bold text-gray-900 font-serif mb-4'>Sənədin Qısa Məlumatı</h3>
            <div className='space-y-3 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-600 font-serif'>Ad:</span>
                <span className='font-medium font-serif'>{formData.title || 'Başlıqsız'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600 font-serif'>Kateqoriya:</span>
                <span className='font-medium font-serif'>
                  {getDocumentCategoryDisplayName(formData.category) || 'Seçilməyib'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600 font-serif'>Klassifikasiya:</span>
                <span className='font-medium font-serif'>
                  {getDocumentClassificationDisplayName(formData.classification) || 'Seçilməyib'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600 font-serif'>Status:</span>
                <span className='font-medium font-serif'>{getDocumentStatusDisplayName(formData.status)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600 font-serif'>Version:</span>
                <span className='font-medium font-serif'>{formData.version || 'Seçilməyib'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600 font-serif'>Content Length:</span>
                <span className='font-medium font-serif'>{formData.content.length} simvol</span>
              </div>
              {formData.tags.length > 0 && (
                <div>
                  <h4 className='text-sm font-medium text-gray-700 font-serif'>Taqlar</h4>
                  <div className='flex flex-wrap gap-1 mt-1'>
                    {formData.tags.map((tag) => (
                      <span key={tag} className='bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-serif'>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content Preview */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
            <h3 className='text-lg font-bold text-gray-900 font-serif mb-4'>Məzmun Prediktiv Görüntüləmə</h3>
            <div className='prose prose-sm max-w-none font-serif border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto'>
              {formData.content ? (
                <div dangerouslySetInnerHTML={{ __html: previewContent }} />
              ) : (
                <p className='text-gray-500 font-serif italic'>Məzmunu yazın və prediktiv görüntüləməni görün.</p>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className='flex items-center justify-between'>
          <Link
            href={`/docs/${document.slug}`}
            className='px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-serif hover:bg-gray-200 transition-colors'
          >
            Ləğv et
          </Link>

          <button
            type='submit'
            disabled={
              isSubmitting || !formData.title || !formData.description || !formData.category || !formData.classification
            }
            className='px-8 py-3 bg-blue-600 text-white rounded-lg font-serif hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
          >
            {isSubmitting ? 'Yenilənir...' : 'Sənədi yenilə'}
          </button>
        </div>
      </form>

      {/* Full Screen Modal */}
      {isFullScreen && (
        <div
          className='fixed inset-0 z-50 bg-white'
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsFullScreen(false);
            }
          }}
          tabIndex={-1}
        >
          <div className='h-full flex flex-col'>
            {/* Modal Header */}
            <div className='bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between'>
              <div>
                <h2 className='text-lg font-medium text-gray-900 font-serif'>Tam Ekran Redaktor</h2>
                <p className='text-sm text-gray-600 font-serif'>
                  {formData.title || 'Başlıqsız Sənəd'} - {formData.content.length} simvol
                </p>
              </div>
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={() => setUseRichEditor(!useRichEditor)}
                  className='text-sm text-blue-600 hover:text-blue-800 font-serif px-3 py-1 border border-blue-200 rounded'
                >
                  {useRichEditor ? 'Raw MDX' : 'Redaktor'}
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className='flex-1 p-4 overflow-hidden'>
              {useRichEditor ? (
                <div className='h-full'>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(content) => handleInputChange('content', content)}
                    placeholder='Sənədin məzmununu buraya yazın...'
                    isFullScreen={true}
                  />
                </div>
              ) : (
                <textarea
                  value={finalMDXContent}
                  onChange={(e) => {
                    // Extract content from MDX when editing raw
                    const lines = e.target.value.split('\n');
                    const contentStart = lines.findIndex((line) => line.trim() === '>');
                    const contentEnd = lines.lastIndexOf('</MDXLayout>');
                    if (contentStart !== -1 && contentEnd !== -1) {
                      const extractedContent = lines
                        .slice(contentStart + 1, contentEnd)
                        .join('\n')
                        .trim();
                      handleInputChange('content', extractedContent);
                    }
                  }}
                  className='w-full h-full px-3 py-2 bg-white border border-gray-300 rounded-md font-mono text-sm focus:ring-blue-500 focus:border-blue-500 resize-none'
                  placeholder='Tam MDX məzmunu...'
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className='bg-gray-50 border-t border-gray-200 p-4 flex justify-between items-center'>
              <div className='text-sm text-gray-600 font-serif'>
                Esc düyməsini basın və ya bağla düyməsini istifadə edin
              </div>
              <button
                type='button'
                onClick={() => setIsFullScreen(false)}
                className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-serif'
              >
                Tam Ekranı Bağla
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
