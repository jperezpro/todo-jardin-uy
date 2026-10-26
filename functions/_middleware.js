// Archivos del repo que no son parte del sitio: README y demas .md, archivos
// que empiezan con punto (.gitignore, .prettierrc) y esta carpeta functions/.
// _redirects ya manda /README.md, /.gitignore y /.prettierrc a la portada, pero
// compara la ruta tal como llega: /README%2Emd o //README.md se le escapan y el
// servidor de archivos igual los entrega. Aca la ruta se decodifica y se
// normaliza antes de comparar, y lo interno va a la portada con un 301.
const INTERNO = [/\.md$/, /\/\.(?!well-known\/)/, /^\/functions\//];

function rutaNormalizada(pathname) {
  let p;
  try {
    p = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  p = p.replace(/\\/g, '/').replace(/\/{2,}/g, '/');
  return new URL(p, 'https://x').pathname.toLowerCase();
}

export async function onRequest({ request, next }) {
  const ruta = rutaNormalizada(new URL(request.url).pathname);
  if (ruta === null || INTERNO.some((re) => re.test(ruta))) {
    return Response.redirect(new URL('/', request.url).toString(), 301);
  }
  return next();
}
