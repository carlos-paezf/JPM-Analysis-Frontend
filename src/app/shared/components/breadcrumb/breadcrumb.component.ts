import { Component } from '@angular/core';
import { BreadcrumbService } from '../../services/breadcrumb.service';


@Component( {
    selector: 'app-breadcrumb',
    templateUrl: './breadcrumb.component.html',
    styleUrls: [ './breadcrumb.component.scss' ]
} )
export class BreadcrumbComponent {
    breadcrumbs$ = this._breadcrumbService.breadcrumbs$;

    constructor ( private readonly _breadcrumbService: BreadcrumbService ) { }
}
