import type { StoreContentField } from '@/types/store';
import { getStorefrontSettings } from '@/features/store/storefront-settings';
import { STORE_PAGE_TITLES } from '@/features/store/store-content';

interface StoreSettingsPageViewProps {
  contentKey: StoreContentField;
  title?: string;
  className?: string;
  children?: React.ReactNode;
}

export async function StoreSettingsPageView({
  contentKey,
  title,
  className = 'container-store max-w-3xl py-12 lg:py-16',
  children,
}: StoreSettingsPageViewProps) {
  const settings = await getStorefrontSettings();
  const content = settings[contentKey]?.trim();
  const pageTitle = title ?? STORE_PAGE_TITLES[contentKey];

  return (
    <div className={className}>
      <h1 className="text-3xl font-black uppercase tracking-tight">{pageTitle}</h1>
      {content ? (
        <div className="prose prose-neutral mt-8 max-w-none whitespace-pre-wrap leading-relaxed text-foreground">
          {content}
        </div>
      ) : (
        <p className="mt-8 text-muted-foreground">
          Content has not been configured yet. Add it under Stores → Settings in catalog-admin.
        </p>
      )}
      {children ? <div className="mt-8">{children}</div> : null}
    </div>
  );
}
