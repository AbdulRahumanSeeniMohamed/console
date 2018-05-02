import store from '../redux';
import { history } from '../components/utils/router';
import { ALL_NAMESPACES_KEY } from '../const';
import { getNSPrefix } from '../components/utils/link';
import { allModels } from '../module/k8s/k8s-models';

// URL routes that can be namespaced
export const namespacedResources = new Set();

allModels().forEach((v, k) => {
  if (!v.namespaced) {
    return;
  }
  if (v.crd) {
    namespacedResources.add(k);
    return;
  }

  namespacedResources.add(v.plural);
});

export const getActiveNamespace = () => store.getState().UI.get('activeNamespace');

export const formatNamespacedRouteForResource = (resource, activeNamespace=getActiveNamespace()) => {
  return activeNamespace === ALL_NAMESPACES_KEY
    ? `/k8s/all-namespaces/${resource}`
    : `/k8s/ns/${activeNamespace}/${resource}`;
};

export const formatNamespaceRoute = (activeNamespace, originalPath, location) => {
  const prefix = getNSPrefix(originalPath);
  if (!prefix) {
    return originalPath;
  }

  originalPath = originalPath.substr(prefix.length + window.SERVER_FLAGS.basePath.length);

  let parts = originalPath.split('/').filter(p => p);
  let previousNS = '';
  if (parts[0] === 'all-namespaces') {
    parts.shift();
    previousNS = ALL_NAMESPACES_KEY;
  } else if (parts[0] === 'ns') {
    parts.shift();
    previousNS = parts.shift();
  }

  if ((previousNS !== activeNamespace && (parts[1] !== 'new' || activeNamespace !== ALL_NAMESPACES_KEY)) || activeNamespace === ALL_NAMESPACES_KEY && parts[1] === 'new') {
    // a given resource will not exist when we switch namespaces, so pop off the tail end
    parts = parts.slice(0, 1);
  }

  const namespacePrefix = activeNamespace === ALL_NAMESPACES_KEY ? 'all-namespaces' : `ns/${activeNamespace}`;

  let path = `${prefix}/${namespacePrefix}`;
  if (parts.length) {
    path += `/${parts.join('/')}`;
  }

  if (location) {
    path += `${location.search}${location.hash}`;
  }

  return path;
};

export const types = {
  setActiveNamespace: 'setActiveNamespace',
  setCurrentLocation: 'setCurrentLocation',
  startImpersonate: 'startImpersonate',
  stopImpersonate: 'stopImpersonate',
  sortList: 'sortList',
  setSidebarOpen: 'setSidebarOpen',
};

export const UIActions = {
  [types.setCurrentLocation]: location => ({location, type: types.setCurrentLocation}),

  [types.setActiveNamespace]: (namespace) => {
    if (namespace) {
      namespace = namespace.trim();
    }

    // make it noop when new active namespace is the same
    // otherwise users will get page refresh and cry about
    // broken direct links and bookmarks
    if (namespace !== getActiveNamespace()) {
      const oldPath = window.location.pathname;
      if (getNSPrefix(oldPath)) {
        history.pushPath(formatNamespaceRoute(namespace, oldPath, window.location));
      }
    }

    return {
      type: types.setActiveNamespace,
      value: namespace,
    };
  },

  [types.startImpersonate]: (kind, name) => ({kind, name, type: types.startImpersonate}),

  [types.stopImpersonate]: () => ({type: types.stopImpersonate}),

  [types.sortList]: (listId, field, func, orderBy, column) => {
    const url = new URL(window.location);
    const sp = new URLSearchParams(window.location.search);
    sp.set('orderBy', orderBy);
    sp.set('sortBy', column);
    history.replace(`${url.pathname}?${sp.toString()}${url.hash}`);
    return {listId, field, func, orderBy, type: types.sortList};
  },

  [types.setSidebarOpen]: open => ({ open, type: types.setSidebarOpen }),
};
