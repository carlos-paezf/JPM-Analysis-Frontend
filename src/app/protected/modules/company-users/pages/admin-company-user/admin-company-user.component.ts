import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { BaseDetailClass } from '../../../../../shared/classes/base-detail.class';
import { AuthUsersService } from '../../../../../shared/services/auth-users.service';
import { ToastrNotificationService } from '../../../../../shared/services/toastr-notification.service';
import { CompanyUserType, FormBaseType, ProfileType } from '../../../../../shared/types';
import { CompanyUsersService } from '../../services/company-users.service';
import { ProfilesService } from '../../../profiles/services/profiles.service';


@Component( {
    selector: 'app-admin-company-user',
    templateUrl: './admin-company-user.component.html',
    styleUrls: [ './admin-company-user.component.scss' ]
} )
export class AdminCompanyUserComponent extends BaseDetailClass<CompanyUserType> implements FormBaseType, OnInit {
    public override sourceSrcset = "../../../../assets/images/Curiosity people-amico.png";
    public override imgSrc = "../../../../assets/images/Curiosity people-amico.svg";

    public form!: FormGroup;
    public submitted: boolean = false;

    public isDataChanged: boolean = false;
    public isAdminUser: boolean = false;

    public profilesInfo: ProfileType[] = [];

    constructor (
        private readonly _activateRoute: ActivatedRoute,
        private readonly _formBuilder: FormBuilder,
        private readonly _location: Location,
        private readonly _toastrNotificationService: ToastrNotificationService,
        private readonly _companyUsersService: CompanyUsersService,
        private readonly _authUserService: AuthUsersService,
        private readonly _profileService: ProfilesService
    ) {
        super();
    }

    ngOnInit (): void {
        this.isAdminUser = this._authUserService.getIsAdminAppUser();
        this._setProfilesInfo();

        this._activateRoute.params.subscribe( params => {
            this.id = params[ 'access_id' ];
            this.isLoading = true;

            this._companyUsersService.getCompanyUserByAccessId( this.id )
                .subscribe( response => {
                    this.data = response;
                    this.isLoading = false;
                    this.formActions();
                } );
        } );
    }

    private _setProfilesInfo () {
        this._profileService.getProfiles().subscribe( value => {
            this.profilesInfo = value.data;
        } );
    }

    /**
     * The function `formActions` creates a form using the FormBuilder module in Angular, sets the
     * initial values of the form fields based on the data object, disables the form if the user is not
     * an admin, and listens for changes in the form values to set a flag indicating that the data has
     * been changed.
     * @returns nothing (undefined) if the `this.data` is falsy.
     */
    formActions () {
        if ( !this.data ) return;

        this.form = this._formBuilder.group( {
            access_id: [ this.data.access_id ],
            user_name: [ this.data.user_name ],
            user_status: [ this.data.user_status ],
            user_type: [ this.data.user_type ],
            employee_id: [ this.data.employee_id ],
            email_address: [ this.data.email_address ],
            user_location: [ this.data.user_location ],
            user_country: [ this.data.user_country ],
            user_logon_type: [ this.data.user_logon_type ],
            user_last_logon_dt: [ this.data.user_last_logon_dt ],
            user_logon_status: [ this.data.user_logon_status ],
            user_group_membership: [ this.data.user_group_membership ],
            user_role: [ this.data.user_role ],
            profile_id: [ this.data.profile_id ],
            createdAt: [ { value: this.data.created_at, disabled: true } ],
            updatedAt: [ { value: this.data.updated_at, disabled: true } ],
            deletedAt: [ { value: this.data.deleted_at, disabled: true } ],
        } );

        this.isAdminUser || this.form.disable();

        this.form.valueChanges.subscribe( _ => {
            this.isDataChanged = true;
        } );
    }

    /**
     * The onSubmit function checks if the user is an admin, validates the profile form, updates the
     * profile, and displays success or error messages.
     * @returns a toastr notification object.
     */
    onSubmit () {
        if ( !this.isAdminUser ) return this._toastrNotificationService.error( {
            title: 'Error',
            message: 'No cuentas con permisos para actualizar el perfil'
        } );

        if ( !this.form.valid ) return this._toastrNotificationService.warning( {
            title: 'Actualización fallida',
            message: 'Por favor, confirma que la información sea valida'
        } );

        const isConfirmedUpdate = window.confirm( `¿Confirma la actualización en la información del usuario ${ this.data!.user_name }?` );

        if ( !isConfirmedUpdate ) return this._toastrNotificationService.info( {
            title: 'Actualización Cancelada',
            message: 'Se canceló la actualización del usuario'
        } );

        this._companyUsersService.updateCompanyUser( this.id, this.form.value );

        this._toastrNotificationService.success( {
            title: 'Actualización exitosa',
            message: 'La información del perfil ha sido actualizada correctamente'
        } );

        this.submitted = true;

        return this._location.back();
    }
}
