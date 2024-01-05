import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { MarkerService } from '../marker.service';
import { LatLngExpression } from 'leaflet';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {
  private map: any;
  searchQuery = "";

  private initMap(): void {
    this.map = L.map('map', {
      center: [ 39.8282, -98.5795 ],
      zoom: 3
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
    var boundingBox = [
      [40.712, -74.227], // Southwest corner (e.g., New York City)
      [34.052, -118.243] // Northeast corner (e.g., Los Angeles)
    ];
    
    this.map.fitBounds(boundingBox);
  }

  constructor(private markerService: MarkerService) { }

  ngAfterViewInit(): void {
    this.initMap();
    this.markerService.makeCapitalMarkers(this.map);
    this.addPolyline();
    // this.markerService.makeCapitalCircleMarkers(this.map);
  }

  private addPolyline(): void {
    const routeCoordinates: LatLngExpression[] = [
      [40.7128, -74.006], // New York City
      [34.0522, -118.2437], // Los Angeles
      // [41.8781, -87.6298] // Chicago
    ];

    const polyline = L.polyline(routeCoordinates, { color: 'blue', weight: 5 }).addTo(this.map);

    // You can add popups or tooltips to specific points on the polyline if needed
    polyline.bindPopup('Start: New York City').openPopup();
    // if (polyline.getPopup()) {
    //   polyline.getPopup().setLatLng([34.0522, -118.2437]).setContent('Middle: Los Angeles');
    //   polyline.getPopup().setLatLng([41.8781, -87.6298]).setContent('End: Chicago');
    // }
  }

  searchLocation(query: string): void {
    this.markerService.searchLocation(query)
      .then(response => {
        const result = response.results[0];
        if (result) {
          const { lat, lng } = result.geometry;
          this.map.setView([lat, lng], 12);
          L.marker([lat, lng]).addTo(this.map).bindPopup(result.formatted).openPopup();
        } else {
          console.error('Location not found');
        }
      })
      .catch(error => {
        console.error('Geocoding error:', error);
      });
  }
}