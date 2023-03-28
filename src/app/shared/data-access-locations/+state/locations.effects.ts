import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { Store } from '@ngrx/store';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { asyncScheduler, merge, of } from 'rxjs';
import { map, switchMap, catchError, filter, debounceTime, groupBy, exhaustMap } from 'rxjs/operators';

import { LocationsActions } from './locations.slice';
import * as LocationsSelectors from './locations.selectors';
import { LocationsService } from '../services/locations.service';
import { fromLocationResponsesToLocations, fromLocationResponseToLocation } from '../models/location-response.model';

@Injectable()
export class LocationsEffects {
  loadLocationsStart$ = createEffect(() =>
    merge(
      this.actions$.pipe(
        ofType(LocationsActions.newLocationsFilter),
        concatLatestFrom(() => this.store.select(LocationsSelectors.getCurrentPage)),
        map(([{ payload: filter }, currentPage]) => ({ filter, page: currentPage ?? 1 })),
      ),
      this.actions$.pipe(
        ofType(LocationsActions.filterPageChange),
        concatLatestFrom(() => [
          this.store.select(LocationsSelectors.getLoadedPages),
          this.store.select(LocationsSelectors.getCurrentFilter),
        ]),
        filter(([{ payload: page }, loadedPages]) => !loadedPages.includes(page)),
        map(([{ payload: page }, , filter]) => ({ filter, page })),
      ),
    ).pipe(map(LocationsActions.loadLocationsStart)),
  );

  resetFilter$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(LocationsActions.resetFilter),
        map(() => this.router.navigate([], { queryParams: {} })),
      ),
    { dispatch: false },
  );

  loadLocations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LocationsActions.loadLocationsStart),
      switchMap(({ payload: { filter, page } }) =>
        this.locationsService.getLocations(filter, page).pipe(
          map(({ info, results }) =>
            LocationsActions.loadLocationsSuccess({
              data: fromLocationResponsesToLocations(results).map((location) => ({
                ...location,
                page,
              })),
              pages: info?.pages || page,
              page,
            }),
          ),
          catchError((error: unknown) => of(LocationsActions.loadLocationsFailure(error))),
        ),
      ),
    ),
  );

  loadLocationDetailsStart$ = createEffect(() => ({ debounce = 500, scheduler = asyncScheduler } = {}) =>
    merge(
      this.actions$.pipe(
        ofType(LocationsActions.enterLocationDetailsPage),
        concatLatestFrom(() => this.store.select(LocationsSelectors.getSelectedId)),
        map(([, locationId]) => locationId),
      ),
      this.actions$.pipe(
        ofType(LocationsActions.hoverLocationOfCharacter),
        debounceTime(debounce, scheduler),
        concatLatestFrom(() => this.store.select(LocationsSelectors.getLocationsEntities)),
        filter(([{ payload: locationId }, locations]) => !locations[locationId]),
        map(([{ payload: locationId }]) => locationId),
      ),
    ).pipe(map(LocationsActions.loadLocationDetailsStart)),
  );

  loadLocationDetails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LocationsActions.loadLocationDetailsStart),
      groupBy(({ payload: locationId }) => locationId),
      switchMap((pairs) =>
        // Avoid multiple calls in parallel to the same locationId
        pairs.pipe(
          exhaustMap(({ payload: locationId }) =>
            this.locationsService.getLocation(locationId).pipe(
              map((location) => LocationsActions.loadLocationDetailsSuccess(fromLocationResponseToLocation(location))),
              catchError((error: unknown) => of(LocationsActions.loadLocationDetailsFailure(error))),
            ),
          ),
        ),
      ),
    ),
  );

  constructor(
    private actions$: Actions,
    private locationsService: LocationsService,
    private store: Store,
    private router: Router,
  ) {}
}
