import { ActivatedRoute } from "@angular/router";
import { SettingComponent } from "./../setting/setting.component";
/**
 * @author Libby Mohlokegi Lebyane
 * @copyright 2020 Nextify Technologies (Pty) Ltd
 */

import { Marker, Map } from "mapbox-gl";
import { ModalController } from "@ionic/angular";
import { BranchService } from "./../../services/branch.service";
import { SocketsService } from "src/app/services/sockets.service";
import { timer } from "rxjs";
import { ToastService } from "src/app/services/toast.service";
import { LoaderService } from "./../../services/loader.service";
import { environment } from "src/environments/environment";
import * as mapboxgl from "mapbox-gl/dist/mapbox-gl.js";
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Input,
} from "@angular/core";
import * as superagent from "superagent";

// Mapbox Authentication TOKEN
mapboxgl.accessToken = environment.MAPBOX;

@Component({
  selector: "app-branch-creator",
  templateUrl: "./branch-creator.component.html",
  styleUrls: ["./branch-creator.component.scss"],
})
export class BranchCreatorComponent implements AfterViewInit {
  @ViewChild("MapContainer", { static: false })
  mapContainer: ElementRef<HTMLDivElement>;
  @ViewChild("SettingComponent", { static: false })
  settingComponent: SettingComponent;

  @Input() token: string;
  @Input() isSelectBranch: boolean;

  map: Map;
  isMapMove = false;
  formattedAddress: string;
  selectedBranchIndex;
  branchMarkers: Marker = [];
  isNewAccount = false;
  constructor(
    private loader: LoaderService,
    private toast: ToastService,
    private branch: BranchService,
    public sockets: SocketsService,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.queryParamMap.subscribe((queryParams) => {
      console.log(queryParams);
      // if (queryParams.)
    });
  }

  ngAfterViewInit() {
    console.log(this.sockets.data.branches);
    this.map = new Map({
      container: this.mapContainer.nativeElement,
      zoom: 12,
      style: "mapbox://styles/lebyanelm/ckafxhtci05gl1ims03863371",
    });

    this.mapContainer.nativeElement.style.height = "450px";
    this.map.on("load", () => {
      this.map.resize();

      // Load the current location and pan the map to it
      navigator.geolocation.getCurrentPosition((position) => {
        this.map.panTo({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        this.loadCurrentAddressLocation();
      });

      // For showing a heatmap of voted areas, to help the partner to know where to expand branches to.
      superagent
        .get(environment.backendServer + "/area/votes?token=" + this.token)
        .end((_, response) => {
          if (response) {
            if (response.status === 200) {
              this.map.addSource("voted-areas", {
                type: "geojson",
                data: response.body.votedAreas,
              });

              this.createVotedAreasHeatmap();
            } else {
              this.toast.show(response.body.reason);
            }
          } else {
            this.toast.show("There was an error while loading area votes.");
          }
        });

      // Load markers on the map
      this.sockets.data.branches.forEach((branch, index) => {
        const markerElement = document.createElement("div"),
          marker = new Marker(markerElement, { offset: [0, -50 / 2] });

        marker
          .setLngLat([branch.coordinates.lng, branch.coordinates.lat])
          .addTo(this.map);

        markerElement.classList.add("branch-point");
        markerElement.innerHTML = (index + 1).toString();
      });

      this.map.on("mousedown", () => {
        this.isMapMove = true;
      });

      this.map.on("mouseup", () => {
        this.isMapMove = false;
        this.loadCurrentAddressLocation();
      });
    });

    // Load previosly selected branch index if any
    this.selectedBranchIndex = this.branch.index;
  }

  async loadCurrentAddressLocation() {
    const coordinates = this.map.getCenter();
    console.log(coordinates);
    this.formattedAddress = await this.geocodeCoordinatesToAddress(
      coordinates.lat,
      coordinates.lng
    );
  }

  geocodeCoordinatesToAddress(lat: number, lng: number) {
    return new Promise<string>((resolve, reject) => {
      superagent
        .get(
          [
            environment.backendServer,
            ["geocoding?latlong=", [lat, lng].join()].join(""),
          ].join("/")
        )
        .end((error, response) => {
          if (response) {
            if (response.status === 200) {
              resolve(response.body.results[0].formatted_address);
            } else {
              reject("Error while loading address.");
            }
          }
        });
    });
  }

  addBranch() {
    const name = this.formattedAddress.split(",");
    // tslint:disable-next-line: max-line-length
    const branch = {
      coordinates: this.map.getCenter(),
      name:
        name.length > 2
          ? [name[1], name[name.length - 1]].join(",")
          : [name[0], name[1]].join(","),
    };

    this.loader.showLoader(true);
    superagent
      .post(environment.backendServer + "/branch")
      .send(branch)
      .set("Authorization", this.token)
      .on("progress", (event) => this.loader.pipe(event.percent))
      .end((error, response) => {
        this.loader.showLoader(false);
        if (response) {
          if (response.status === 200) {
            this.toast.show("Branch created!");
            timer(2000).subscribe(() => (this.formattedAddress = null));

            this.sockets.data.branches.push(response.body.branch);

            // Remove the remember branch setting saved
            if (localStorage.getItem("branch")) {
              localStorage.removeItem("branch");
            }
          } else {
            this.toast.show(
              response.body.reason || "ERROR: SOMETHING WENT WRONG."
            );
          }
        } else {
          this.toast.show("Not connected to the internet!");
        }
      });
  }

  selectBranch(index) {
    this.selectedBranchIndex = index;
    if (!this.isSelectBranch) {
      this.confirmBranch();
    } else {
      const branch = this.sockets.data.branches[index];
      this.map.panTo([branch.coordinates.lng, branch.coordinates.lat]);
    }
  }

  confirmBranch() {
    this.branch.index = this.selectedBranchIndex;

    // Save the branch selected if the partner selected to do so.
    if (this.settingComponent && this.settingComponent.isChecked) {
      const data = {
        lastSet: Date.now(),
        isRemember: this.settingComponent.isChecked,
        index: this.branch.index,
      };
      localStorage.setItem("branch", JSON.stringify(data));
    }
  }

  deleteBranch(id) {
    this.loader.showLoader(true);
    superagent
      .delete(environment.backendServer + "/branch?branchId=" + id)
      .set("Authorization", this.token)
      .on("progress", (event) => this.loader.pipe(event.percent))
      .end((error, response) => {
        this.loader.showLoader(false);
        if (response) {
          if (response.status === 200) {
            this.toast.show("Branch deleted!");
            this.sockets.data.branches.forEach((branch, index) => {
              if (branch.id === id) {
                this.sockets.data.branches.splice(index, 1);
              }
            });
          }
        }
      });
  }

  createVotedAreasHeatmap() {
    this.map.addLayer(
      {
        id: "voted-areas-heat",
        type: "heatmap",
        source: "voted-areas",
        paint: {
          // Increase the heatmap weight based on frequency and property magnitude
          "heatmap-weight": ["interpolate", ["linear"], 5, 0, 0, 6, 1],
          // Increase the heatmap color weight weight by zoom level
          // heatmap-intensity is a multiplier on top of heatmap-weight
          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            1,
            9,
            3,
          ],
          // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
          // Begin color ramp at 0-stop with a 0-transparancy color
          // to create a blur-like effect.
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(33,102,172,0)",
            0.2,
            "rgb(103,169,207)",
            0.4,
            "rgb(209,229,240)",
            0.6,
            "rgb(253,219,199)",
            0.8,
            "rgb(239,138,98)",
            1,
            "rgb(178,24,43)",
          ],
          // Adjust the heatmap radius by zoom level
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 9, 20],
          // Transition from heatmap to circle layer by zoom level
          "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 7, 1, 9, 0],
        },
      },
      "waterway-label"
    );
  }
}
