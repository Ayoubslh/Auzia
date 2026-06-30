import React, { useRef, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  label?: string;
}

interface LeafletMapProps {
  markers?: MapMarker[];
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  onMarkerPress?: (id: string) => void;
}

function buildHTML(
  markers: MapMarker[],
  lat: number,
  lng: number,
  zoom: number
): string {
  // Safely embed config as a JS literal — no eval, no dynamic scripts
  const config = JSON.stringify({ lat, lng, zoom, markers });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport"
        content="width=device-width, initial-scale=1.0,
                 user-scalable=no, maximum-scale=1.0"/>
  <link rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossorigin=""/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          crossorigin=""></script>
  <style>
    *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
    html,body,#map{width:100%;height:100%;background:#e8f0e8}
    /* Zoom control colours */
    .leaflet-control-zoom a{color:#006430;border-color:#cde0d0}
    .leaflet-control-zoom a:hover{background:#f0f8f2}
    /* Custom circular pin */
    .dz-pin{
      width:12px;height:12px;
      background:#EF4444;
      border:2.5px solid #fff;
      border-radius:50%;
      box-shadow:0 1px 4px rgba(0,0,0,.35);
      cursor:pointer;
    }
    .leaflet-popup-content-wrapper{
      border-radius:10px;
      box-shadow:0 2px 12px rgba(0,0,0,.15);
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      font-size:13px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
  (function(){
    try{
      var cfg=${config};
      var map=L.map('map',{
        center:[cfg.lat,cfg.lng],
        zoom:cfg.zoom,
        zoomControl:true,
        attributionControl:false
      });

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        {subdomains:'abcd',maxZoom:19}
      ).addTo(map);

      cfg.markers.forEach(function(m){
        var icon=L.divIcon({
          className:'',
          html:'<div class="dz-pin"></div>',
          iconSize:[12,12],
          iconAnchor:[6,6],
          popupAnchor:[0,-10]
        });
        var mk=L.marker([m.latitude,m.longitude],{icon:icon});
        mk.on('click',function(){
          try{
            window.ReactNativeWebView&&
              window.ReactNativeWebView.postMessage(
                JSON.stringify({type:'markerPress',id:m.id})
              );
          }catch(e){}
        });
        mk.addTo(map);
      });
    }catch(e){
      document.body.innerHTML='<pre style="padding:12px;color:red">'+e+'</pre>';
    }
  })();
  </script>
</body>
</html>`;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  markers = [],
  centerLat = 46.2276,
  centerLng = 2.2137,
  zoom = 5,
  onMarkerPress,
}) => {
  const html = buildHTML(markers, centerLat, centerLng, zoom);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'markerPress' && onMarkerPress) {
          onMarkerPress(data.id);
        }
      } catch (_) {}
    },
    [onMarkerPress]
  );

  return (
    <View style={styles.container}>
      <WebView
        source={{ html, baseUrl: '' }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState={false}
        scrollEnabled={false}
        // Allow loading cartocdn tiles (network request)
        mixedContentMode="always"
        originWhitelist={['*']}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1, backgroundColor: '#e8f0e8' },
});
