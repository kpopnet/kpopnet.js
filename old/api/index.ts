/**
 * Reusable kpopnet components.
 *
 * Can be used to add profiles/face recognition functionality to
 * third-party sites (intended for cutechan).
 *
 * @module kpopnet/api
 */

// NOTE(Kagami): Make sure to import only essential modules here to keep
// build size small.

import { Idol, Profiles } from "./profiles";

export {
  ProfileValue,
  Band,
  Idol,
  Profiles,
  RenderedLine,
  Rendered,
  renderIdol,
  BandMap,
  IdolMap,
  getBandMap,
  getIdolMap,
  searchIdols,
} from "./profiles";

declare const API_PREFIX: string;
declare const FILE_PREFIX: string;

const unknownErr = "unknownErr";

function handleResponse(res: Response): Promise<any> {
  return res.ok ? res.json() : handleErrorCode(res);
}

function handleErrorCode(res: Response): Promise<any> {
  const ctype = res.headers.get("Content-Type");
  const isHtml = ctype.startsWith("text/html");
  const isJson = ctype.startsWith("application/json");
  if (isHtml) {
    // Probably 404/500 page, don't bother parsing.
    throw new Error(unknownErr);
  } else if (isJson) {
    // Probably standardly-shaped JSON error.
    return res.json().then((data) => {
      throw new Error((data && data.error) || unknownErr);
    });
  } else {
    // Probably text/plain or something like this.
    return res.text().then((data) => {
      throw new Error(data || unknownErr);
    });
  }
}

function handleError(err: Error) {
  throw new Error(err.message || unknownErr);
}

export interface ApiOpts {
  prefix?: string;
}

/**
 * Get all profiles. ~47kb gzipped currently.
 */
export function getProfiles(opts: ApiOpts = {}): Promise<Profiles> {
  // const prefix = opts.prefix || API_PREFIX;
  // return fetch(`${prefix}/profiles`, { credentials: "same-origin" }).then(
  //   handleResponse,
  //   handleError
  // );
  return Promise.resolve({
    bands: [
      {
        agency_name: "Pledis",
        debut_date: "2017-03-21",
        disband_date: "2019-05-24",
        id: "KWGkvTokzv6h",
        name: "Pristin",
        name_original: "프리스틴",
      },
    ],
    idols: [
      {
        birth_date: "1997-07-29",
        debut_date: "2017-03-21",
        band_id: "KWGkvTokzv6h",
        height: 172.0,
        id: "G_DuWxfoSlXa",
        name: "Minkyeung",
        name_hangul: "민경",
        birth_name: "Kim Minkyung",
        birth_name_hangul: "김민경",
        weight: 50.0,
      },
    ],
  });
}

export interface FileOpts {
  small?: boolean;
  prefix?: string;
  fallback?: string;
}

/**
 * Get URL of the idol's preview image. Safe to use in <img> element
 * right away.
 */
export function getIdolPreviewUrl(idol: Idol, opts: FileOpts = {}): string {
  const prefix = opts.prefix || FILE_PREFIX;
  const fallback = opts.fallback || "/static/img/no-preview.svg";
  const sizeDir = opts.small ? "thumb" : "src";
  const sha1 = idol.image_id;
  // NOTE(Kagami): This assumes that filetype of the preview image is
  // always JPEG. It must be ensured by Idol API service.
  return sha1
    ? `${prefix}/${sizeDir}/${sha1.slice(0, 2)}/${sha1.slice(2)}.jpg`
    : fallback;
}

export interface ImageIdData {
  SHA1: string;
}

/**
 * Set idol's preview.
 */
export function setIdolPreview(
  idol: Idol,
  file: File,
  opts: ApiOpts = {}
): Promise<ImageIdData> {
  const prefix = opts.prefix || API_PREFIX;
  const form = new FormData();
  form.append("files[]", file);
  return fetch(`${prefix}/${idol.id}/preview`, {
    credentials: "same-origin",
    method: "POST",
    body: form,
  }).then(handleResponse, handleError);
}

export interface IdolIdData {
  id: string;
}

/**
 * Recognize idol.
 */
export function recognizeIdol(
  file: File,
  opts: ApiOpts = {}
): Promise<IdolIdData> {
  const prefix = opts.prefix || API_PREFIX;
  const form = new FormData();
  form.append("files[]", file);
  return fetch(`${prefix}/recognize`, {
    credentials: "same-origin",
    method: "POST",
    body: form,
  }).then(handleResponse, handleError);
}
