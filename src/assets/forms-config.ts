export interface FormConfig {
  label: string
  rdfClass: string
  schema: () => Promise<Record<string, unknown>>
  template: () => Promise<string>
  templateFormat: string
}

const formsRegistry: Record<string, FormConfig> = {
  demo: {
    label: 'Procedure',
    rdfClass: 'pko:Procedure',
    schema: () => import('./form-procedure.json').then((m) => m.default as Record<string, unknown>),
    template: () => import('./template-procedure.jinja?raw').then((m) => m.default),
    templateFormat: 'text/turtle',
  }
}

export function getFormConfig(key: string): FormConfig | undefined {
  return formsRegistry[key]
}

export function getFormKeys(): string[] {
  return Object.keys(formsRegistry)
}

export function getFormOptions(): { title: string; value: string }[] {
  return Object.entries(formsRegistry).map(([key, cfg]) => ({
    title: cfg.label,
    value: key,
  }))
}

export default formsRegistry
