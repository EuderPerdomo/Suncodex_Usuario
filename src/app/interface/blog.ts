export interface Blog {
    titulo: string;
    slug: string;
    categoria: Categoria;
    comentarios:Comentario[],
    contenido: string;
    portada: string;
    fecha:string,
    autor:string,
    createdAt:any,
    _id:any,

  }

  export interface Categoria {
    titulo: string;
    slug: '';
    _id: String | undefined; // O el tipo correcto para _id
  }

  
  export interface Comentario {
    nombre: string;
    email: '';
    comentario:''
    _id: String | undefined; // O el tipo correcto para _id
    createdAt:any,
  }