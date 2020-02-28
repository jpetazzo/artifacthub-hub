import isUndefined from 'lodash/isUndefined';
import camelCase from 'lodash/camelCase';
import isObject from 'lodash/isObject';
import isArray from 'lodash/isArray';
import { Package, Stats, SearchQuery, PackagesUpdates, SearchResults } from '../types';
import getHubBaseURL from '../utils/getHubBaseURL';

interface Result {
  [key: string]: any;
}

const toCamelCase = (r: any): Result => {
  if (isArray(r)) {
    return r.map(v => toCamelCase(v));
  } else if (isObject(r)) {
    return Object.keys(r).reduce(
      (result, key) => ({
        ...result,
        [camelCase(key)]: toCamelCase((r as Result)[key]),
      }),
      {},
    );
  }
  return r;
};

const apiFetch = (url: string): any => {
  return fetch(url)
    .then(res => (res.ok ? res : Promise.reject(res)))
    .then(res => res.json())
    .then(res => toCamelCase(res));
}

const API_BASE_URL = `${getHubBaseURL()}/api/v1`;

const API = {
  getPackage: (id?: string, version?: string): Promise<Package> => {
    return apiFetch(`${API_BASE_URL}/package/${id}${!isUndefined(version) ? `/${version}` : ''}`);
  },

  searchPackages: (query: SearchQuery): Promise<SearchResults> => {
    const q = new URLSearchParams();
    q.set('facets', 'true');
    q.set('limit', (query.limit).toString());
    q.set('offset', (query.offset).toString());
    if (!isUndefined(query.filters)) {
      Object.keys(query.filters).forEach((filterId: string) => {
        return query.filters[filterId].forEach((id: string) => {
          q.append(filterId, id);
        });
      });
    }
    if (!isUndefined(query.text)) {
      q.set('text', query.text);
    }
    return apiFetch(`${API_BASE_URL}/search?${q.toString()}`);
  },

  getStats: (): Promise<Stats> => {
    return apiFetch(`${API_BASE_URL}/stats`);
  },

  getPackagesUpdates: (): Promise<PackagesUpdates> => {
    return apiFetch(`${API_BASE_URL}/updates`);
  },
};

export default API;
