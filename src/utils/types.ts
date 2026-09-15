export interface Link {
  label: string;
  href: string;
  active?: boolean;
}

export interface CreateElementOptions {
  className?: string;
  textContent?: string;
  attributes?: Record<string, string>;
}
