import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

interface GraphqlResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

@Injectable({ providedIn: 'root' })
export class GraphqlClientService {
  private readonly http = inject(HttpClient);

  /**
   * Sends a GraphQL operation and emits `data`.
   * Errors from the network or the GraphQL `errors` array become an `Error` with a readable message.
   */
  request<T>(url: string, query: string, variables: Record<string, unknown> = {}): Observable<T> {
    return this.http.post<GraphqlResponse<T>>(url, { query, variables }).pipe(
      map((response) => {
        if (response.errors?.length) {
          throw new Error(response.errors.map((e) => e.message).join('; '));
        }
        if (!response.data) {
          throw new Error('The server returned no data.');
        }
        return response.data;
      }),
      catchError((error: unknown) => throwError(() => toReadableError(error))),
    );
  }
}

function toReadableError(error: unknown): Error {
  if (error instanceof HttpErrorResponse) {
    return new Error(
      error.status === 0
        ? 'Could not reach the server. Check your connection.'
        : `The server responded with an error (${error.status}).`,
    );
  }
  return error instanceof Error ? error : new Error('Something went wrong.');
}
