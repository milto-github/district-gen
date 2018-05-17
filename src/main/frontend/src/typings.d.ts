import * as L from 'leaflet';

/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

declare module 'leaflet' {
  namespace control {
    function browserPrint(options?: any): Control.BrowserPrint;
    function search(options?: any): Control.Search;
  }
  namespace Control {
    interface BrowserPrint {
      addTo(map: L.Map): any;
    }
    interface Search {
      addTo(map: L.Map): any;
      on(type: string, fn: LeafletEventHandlerFn, context?: any): any;
    }
  }
}
