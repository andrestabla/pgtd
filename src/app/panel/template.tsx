// Se re-monta en cada navegación: da la transición de entrada por página.
export default function PanelTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
