'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ContentStatus, DocumentClassification, DocumentCategory } from '@prisma/client';
import RichTextEditor from './RichTextEditor';
import {
  getDocumentCategoryDisplayName,
  getDocumentClassificationDisplayName,
  getDocumentStatusDisplayName,
} from '@/lib/utils';

interface FormData {
  title: string;
  description: string;
  content: string;
  category: DocumentCategory;
  version: string;
  effectiveDate: string;
  classification: DocumentClassification;
  tags: string[];
  status: ContentStatus;
}

const generateMDXFromContent = (content: string, title: string, description: string): string => {
  return `import { MDXLayout } from '@/components/MDXLayout';

export const metadata = {
  title: '${title || 'Sənədin Adı'}',
};

<MDXLayout 
  title="${title || 'Sənədin Adı'}"
  description="${description || 'Sənədin təsviri'}"
  date="${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}"
>

${content || '# Sənədin məzmununu buraya yazın...'}

</MDXLayout>`;
};

export default function CreateDocumentForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [useRichEditor, setUseRichEditor] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    content:
      '# Giriş\n\nSənədin məzmununu buraya yazın...\n\n## Bölmə 1\n\nMəzmun **qalın tekst**, _italic tekst_, və [linklər](https://example.com).\n\n- Birinci seçim\n- İkinci seçim\n',
    category: DocumentCategory.OTHER,
    version: '1.0',
    effectiveDate: '',
    classification: DocumentClassification.PUBLIC,
    tags: [],
    status: ContentStatus.DRAFT,
  });

  // Block/unblock body scroll when modal opens/closes
  useEffect(() => {
    if (isFullScreen) {
      // Block scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scroll
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFullScreen]);

  const finalMDXContent = useMemo(
    () => generateMDXFromContent(formData.content, formData.title, formData.description),
    [formData.content, formData.title, formData.description]
  );

  // Convert markdown to HTML-like preview
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/documents/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          content: finalMDXContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create document');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/docs');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({
      ...prev,
      content,
    }));
  };

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

  if (success) {
    return (
      <div className='bg-green-50 border border-green-200 rounded-lg p-8 text-center'>
        <div className='w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4'>
          <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
          </svg>
        </div>
        <h2 className='text-2xl font-bold text-green-900 font-serif mb-2'>Sənəd uğurla yaradıldı!</h2>
        <p className='text-green-700 font-serif'>Sənədlər səhifəsinə yönləndirilir...</p>
      </div>
    );
  }

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

        {/* Document Information Card - Full Width */}
        <div className='bg-white rounded-lg p-6 border shadow-sm'>
          <h3 className='text-xl font-medium text-gray-900 font-serif mb-6'>Sənəd Məlumatları</h3>

          <div className='space-y-6'>
            {/* Basic Info */}
            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <label htmlFor='title' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                  Sənədin Adı *
                </label>
                <input
                  type='text'
                  id='title'
                  name='title'
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
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
                  name='version'
                  value={formData.version}
                  onChange={handleChange}
                  className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
                  placeholder='1.0'
                />
              </div>
            </div>

            <div>
              <label htmlFor='description' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                Təsvir
              </label>
              <textarea
                id='description'
                name='description'
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
                placeholder='Sənədin təsvirini daxil edin'
              />
            </div>

            {/* Category and Classification */}
            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <label htmlFor='category' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                  Kateqoriya *
                </label>
                <select
                  id='category'
                  name='category'
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
                >
                  {Object.values(DocumentCategory).map((category) => (
                    <option key={category} value={category}>
                      {getDocumentCategoryDisplayName(category)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor='classification' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                  Klassifikasiya *
                </label>
                <select
                  id='classification'
                  name='classification'
                  value={formData.classification}
                  onChange={handleChange}
                  required
                  className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
                >
                  {Object.values(DocumentClassification).map((classification) => (
                    <option key={classification} value={classification}>
                      {getDocumentClassificationDisplayName(classification)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status and Effective Date */}
            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <label htmlFor='status' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                  Status *
                </label>
                <select
                  id='status'
                  name='status'
                  value={formData.status}
                  onChange={handleChange}
                  className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
                >
                  {Object.values(ContentStatus).map((status) => (
                    <option key={status} value={status}>
                      {getDocumentStatusDisplayName(status)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor='effectiveDate' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                  Effektivlik tarixi
                </label>
                <input
                  type='date'
                  id='effectiveDate'
                  name='effectiveDate'
                  value={formData.effectiveDate}
                  onChange={handleChange}
                  className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
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

        {/* Document Content Card */}
        <div className='bg-white rounded-lg p-6 border shadow-sm'>
          <div className='flex items-center justify-between mb-6'>
            <h3 className='text-xl font-medium text-gray-900 font-serif'>Sənədin Məzmunu</h3>
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
              onChange={handleContentChange}
              placeholder='Sənədin məzmununu buraya yazın...'
            />
          ) : (
            <textarea
              name='content'
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
                  handleContentChange(extractedContent);
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

        {/* Bottom Cards - Document Info and Preview */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Document Information Summary */}
          <div className='bg-white rounded-lg p-6 border shadow-sm'>
            <h3 className='text-lg font-medium text-gray-900 font-serif mb-4'>Sənədin Qısa Məlumatı</h3>

            <div className='space-y-4'>
              <div>
                <h4 className='text-sm font-medium text-gray-700 font-serif'>Ad</h4>
                <p className='text-gray-900 font-serif'>{formData.title || 'Not set'}</p>
              </div>

              <div>
                <h4 className='text-sm font-medium text-gray-700 font-serif'>Təsvir</h4>
                <p className='text-gray-900 font-serif'>{formData.description || 'Not set'}</p>
              </div>

              <div>
                <h4 className='text-sm font-medium text-gray-700 font-serif'>Kateqoriya</h4>
                <p className='text-gray-900 font-serif'>{getDocumentCategoryDisplayName(formData.category)}</p>
              </div>

              <div>
                <h4 className='text-sm font-medium text-gray-700 font-serif'>Versiya & Status</h4>
                <p className='text-gray-900 font-serif'>
                  v{formData.version} - {formData.status}
                </p>
              </div>

              <div>
                <h4 className='text-sm font-medium text-gray-700 font-serif'>Klassifikasiya</h4>
                <p className='text-gray-900 font-serif'>
                  {getDocumentClassificationDisplayName(formData.classification)}
                </p>
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

              <div className='pt-4 border-t border-gray-200'>
                <h4 className='text-sm font-medium text-gray-700 font-serif mb-2'>Redaktor Xüsusiyyətləri</h4>
                <ul className='text-sm text-gray-600 space-y-1 font-serif'>
                  <li>• Rich text alətləri ilə formatlama</li>
                  <li>• MDX formatına avtomatik çevrilmə</li>
                  <li>• Tam ekran redaktə rejimi</li>
                  <li>• Klaviatura qısayolları (Ctrl+B, Ctrl+I, etc.)</li>
                  <li>• Başlıqlar, siyahılar, linklər və s.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Content Preview - Always Visible */}
          <div className='bg-white rounded-lg p-6 border shadow-sm'>
            <h3 className='text-lg font-medium text-gray-900 font-serif mb-4'>Məzmun Prediktiv Görüntüləmə</h3>

            <div className='prose prose-sm max-w-none'>
              <div className='bg-gray-50 p-4 rounded border mdx-document max-h-96 overflow-y-auto'>
                <div
                  className='font-serif text-sm leading-relaxed'
                  dangerouslySetInnerHTML={{ __html: previewContent }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className='flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200'>
          <button
            type='submit'
            disabled={isLoading}
            className='bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors font-serif disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? 'Sənəd yaradılır...' : 'Sənəd yaradılır'}
          </button>
          <Link
            href='/docs'
            className='border border-gray-300 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors font-serif text-center'
          >
            Ləğv et
          </Link>
        </div>
      </form>

      {/* Full Screen Modal */}
      {isFullScreen && (
        <div
          className='fixed inset-0 bg-white z-50 flex flex-col'
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsFullScreen(false);
            }
          }}
          tabIndex={-1}
        >
          {/* Modal Header */}
          <div className='bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between'>
            <div>
              <h2 className='text-lg font-medium text-gray-900 font-serif'>Tam Ekran Redaktor</h2>
              <p className='text-sm text-gray-600 font-serif'>
                {formData.title || 'Sənədin Adı'} - {formData.content.length} simvol
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
                  onChange={handleContentChange}
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
                    handleContentChange(extractedContent);
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
      )}
    </>
  );
}
