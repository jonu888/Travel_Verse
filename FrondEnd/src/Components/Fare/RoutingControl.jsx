import L from "leaflet";
import { createControlComponent } from "@react-leaflet/core";
import PropTypes from 'prop-types';
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { startIcon, endIcon } from './MarkerIcons';

const createRoutineMachineLayer = ({
  position,
  start,
  end,
  color,
  onWaypointChange
}) => {
  const instance = L.Routing.control({
    position,
    waypoints: [
      L.latLng(start[0], start[1]),
      L.latLng(end[0], end[1])
    ],
    lineOptions: {
      styles: [{ color, weight: 6, opacity: 0.7 }], 
      extendToWaypoints: true,
      missingRouteTolerance: 100,
      addWaypoints: true
    },
    show: false,
    addWaypoints: true,
    draggableWaypoints: true,
    routeWhileDragging: true,
    showAlternatives: false,
    fitSelectedRoutes: false,
    dragStyle: {
      opacity: 0.9,
      className: 'routing-draw-touch',
      weight: 8,
      touchArea: 50 
    },
    waypointMode: 'connect',
    createMarker: function(i, wp, n) {
      const marker = L.marker(wp.latLng, {
        draggable: true,
        icon: i === 0 ? startIcon : i === (n-1) ? endIcon : L.divIcon({
          className: 'custom-waypoint-touch',
          html: `<div style="width:18px;height:18px;background:white;border:3px solid ${color};border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [18, 18],
          iconAnchor: [12, 12]
        })
      });

      marker.on('touchstart', (e) => {
        L.DomEvent.preventDefault(e);
        marker.dragging.enable();
      });

      return marker;
    }
  });

  instance.on('waypoint:click', (e) => {
    e.waypoint.dragging.enable();
  });

  instance.on('routesfound', (e) => {
    if (e.routes && e.routes.length > 0) {
      const totalDistance = e.routes[0].summary.totalDistance / 1000;
      const points = instance.getWaypoints()
        .filter(wp => wp.latLng)
        .map(wp => [wp.latLng.lat, wp.latLng.lng]);
      onWaypointChange?.(points, totalDistance);
    }
  });

  return instance;
};

const style = document.createElement('style');
style.textContent = `
  .routing-draw-touch {
    cursor: pointer;
    pointer-events: all;
  }
  .custom-waypoint-touch {
    cursor: grab;
    touch-action: none;
  }
  .leaflet-touch .leaflet-routing-container {
    touch-action: none;
  }
`;
document.head.appendChild(style);

const RoutingControl = createControlComponent(createRoutineMachineLayer);

RoutingControl.propTypes = {
  position: PropTypes.string.isRequired,
  start: PropTypes.arrayOf(PropTypes.number).isRequired,
  end: PropTypes.arrayOf(PropTypes.number).isRequired,
  color: PropTypes.string.isRequired,
  onWaypointChange: PropTypes.func
};

export default RoutingControl;
