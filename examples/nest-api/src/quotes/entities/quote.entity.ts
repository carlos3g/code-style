/**
 * Domain entity. Internal `id` for relations; public `uuid` is the only
 * identifier the API ever exposes.
 */
export interface Quote {
  id: number;
  uuid: string;
  text: string;
  author: string;
}
