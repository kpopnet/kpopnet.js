export function Link(p: { url: string; text: string }) {
  return (
    <a class="link" href={p.url} target="_blank" rel="noopener noreferrer">
      {p.text}
    </a>
  );
}
