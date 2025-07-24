import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ContentStatus, DocumentCategory, DocumentClassification, MemberStatus } from '@prisma/client';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMemberStatusDisplayName(status: MemberStatus) {
  switch (status) {
    case MemberStatus.ACTIVE:
      return 'Aktiv';
    case MemberStatus.INACTIVE:
      return 'Deaktiv';
    case MemberStatus.BANNED:
      return 'Cəzalı';
    default:
      return 'Bilinməyən';
  }
}

export function getDocumentCategoryDisplayName(category: DocumentCategory) {
  const names: { [key in DocumentCategory]: string } = {
    CONSTITUTION: 'Konstitusiya',
    LAW: 'Qanun',
    CODE: 'Məcəllə',
    DECREE: 'Fərman',
    RESOLUTION: 'Sərəncam',
    REGULATION: 'Norma / Əmr',
    OTHER: 'Digər',
  };

  return names[category];
}

export function getDocumentCategoryDescription(category: DocumentCategory) {
  const descriptions: { [key in DocumentCategory]: string } = {
    CONSTITUTION: `Dövlətin əsas qanunu və ali hüquqi aktları`,
    LAW: `Adminstrasiya tərəfindən qəbul edilən qanunvericilik aktları`,
    CODE: `Hüququn müəyyən sahələrini tənzimləyən məcəllələr`,
    DECREE: `Baş Admin və digər səlahiyyətli şəxslər tərəfindən verilən rəsmi fərmanlar`,
    RESOLUTION: `Adminstrasiya və digər orqanlar tərəfindən qəbul edilən sərəncam və qərarlar`,
    REGULATION: `Adminstrasiya və qurumlar tərəfindən müəyyən edilən normativ tənzimləyici qaydalar`,
    OTHER: `Müxtəlif kateqoriyaya aid rəsmi sənədlər`,
  };

  return descriptions[category];
}

export function getDocumentStatusDisplayName(status: ContentStatus) {
  const names: { [key in ContentStatus]: string } = {
    DRAFT: 'Qaralama',
    PUBLISHED: 'Yayımlanmış',
    ARCHIVED: 'Arxivlənmiş',
  };

  return names[status];
}

export function getDocumentClassificationDisplayName(classification: DocumentClassification) {
  const names: { [key in DocumentClassification]: string } = {
    PUBLIC: 'İctimai',
    INTERNAL: 'Daxili',
    RESTRICTED: 'Məhdudlaşdırılmış',
  };

  return names[classification];
}
