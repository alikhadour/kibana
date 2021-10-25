/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import './login_page.scss';

import { EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiTitle } from '@elastic/eui';
import classNames from 'classnames';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BehaviorSubject } from 'rxjs';
import { parse } from 'url';

import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';
import type { CoreStart, FatalErrorsStart, HttpStart, NotificationsStart } from 'src/core/public';

import {
  AUTH_PROVIDER_HINT_QUERY_STRING_PARAMETER,
  LOGOUT_REASON_QUERY_STRING_PARAMETER,
} from '../../../common/constants';
import type { LoginState } from '../../../common/login_state';
import { DisabledLoginForm, LoginForm, LoginFormMessageType } from './components';

interface Props {
  http: HttpStart;
  notifications: NotificationsStart;
  fatalErrors: FatalErrorsStart;
  loginAssistanceMessage: string;
}

interface State {
  loginState: LoginState | null;
}

const messageMap = new Map([
  [
    'SESSION_EXPIRED',
    {
      type: LoginFormMessageType.Info,
      content: i18n.translate('xpack.security.login.sessionExpiredDescription', {
        defaultMessage: 'Your session has timed out. Please log in again.',
      }),
    },
  ],
  [
    'LOGGED_OUT',
    {
      type: LoginFormMessageType.Info,
      content: i18n.translate('xpack.security.login.loggedOutDescription', {
        defaultMessage: 'You have logged out of Safee Tracking Data Analyzer.',
      }),
    },
  ],
  [
    'UNAUTHENTICATED',
    {
      type: LoginFormMessageType.Danger,
      content: i18n.translate('xpack.security.unauthenticated.errorDescription', {
        defaultMessage:
          "We hit an authentication error. Please check your credentials and try again. If you still can't log in, contact your system administrator.",
      }),
    },
  ],
]);

export class LoginPage extends Component<Props, State> {
  state = { loginState: null } as State;

  public async componentDidMount() {
    const loadingCount$ = new BehaviorSubject(1);
    this.props.http.addLoadingCountSource(loadingCount$.asObservable());

    try {
      this.setState({ loginState: await this.props.http.get('/internal/security/login_state') });
    } catch (err) {
      this.props.fatalErrors.add(err);
    }

    loadingCount$.next(0);
    loadingCount$.complete();
  }

  public render() {
    const loginState = this.state.loginState;
    if (!loginState) {
      return null;
    }

    const isSecureConnection = !!window.location.protocol.match(/^https/);
    const { allowLogin, layout, requiresSecureConnection } = loginState;

    const loginIsSupported =
      requiresSecureConnection && !isSecureConnection ? false : allowLogin && layout === 'form';

    const contentHeaderClasses = classNames('loginWelcome__content', 'eui-textCenter', {
      ['loginWelcome__contentDisabledForm']: !loginIsSupported,
    });

    const contentBodyClasses = classNames('loginWelcome__content', 'loginWelcome-body', {
      ['loginWelcome__contentDisabledForm']: !loginIsSupported,
    });

    return (
      <div className="loginWelcome login-form">
        <header className="loginWelcome__header">
          <div className={contentHeaderClasses}>
            <EuiSpacer size="xxl" />
            <img
              src="data:image/png;base64,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"
              alt="logo"
              style={{ width: '120px', height: '120px' }}
            />
            <EuiTitle size="m" className="loginWelcome__title">
              <h1>
                <FormattedMessage
                  id="xpack.security.loginPage.welcomeTitle"
                  defaultMessage="Welcome to Safee Tracking Data Analyzer"
                />
              </h1>
            </EuiTitle>
            <EuiSpacer size="xl" />
          </div>
        </header>
        <div className={contentBodyClasses}>
          <EuiFlexGroup gutterSize="l">
            <EuiFlexItem>{this.getLoginForm({ ...loginState, isSecureConnection })}</EuiFlexItem>
          </EuiFlexGroup>
        </div>
      </div>
    );
  }

  private getLoginForm = ({
    layout,
    requiresSecureConnection,
    isSecureConnection,
    selector,
    loginHelp,
  }: LoginState & { isSecureConnection: boolean }) => {
    const isLoginExplicitlyDisabled = selector.providers.length === 0;
    if (isLoginExplicitlyDisabled) {
      return (
        <DisabledLoginForm
          title={
            <FormattedMessage
              id="xpack.security.loginPage.noLoginMethodsAvailableTitle"
              defaultMessage="Login is disabled."
            />
          }
          message={
            <FormattedMessage
              id="xpack.security.loginPage.noLoginMethodsAvailableMessage"
              defaultMessage="Contact your system administrator."
            />
          }
        />
      );
    }

    if (requiresSecureConnection && !isSecureConnection) {
      return (
        <DisabledLoginForm
          title={
            <FormattedMessage
              id="xpack.security.loginPage.requiresSecureConnectionTitle"
              defaultMessage="A secure connection is required for log in"
            />
          }
          message={
            <FormattedMessage
              id="xpack.security.loginPage.requiresSecureConnectionMessage"
              defaultMessage="Contact your system administrator."
            />
          }
        />
      );
    }

    if (layout === 'error-es-unavailable') {
      return (
        <DisabledLoginForm
          title={
            <FormattedMessage
              id="xpack.security.loginPage.esUnavailableTitle"
              defaultMessage="Cannot connect to the Elasticsearch cluster"
            />
          }
          message={
            <FormattedMessage
              id="xpack.security.loginPage.esUnavailableMessage"
              defaultMessage="See the Kibana logs for details and try reloading the page."
            />
          }
        />
      );
    }

    if (layout === 'error-xpack-unavailable') {
      return (
        <DisabledLoginForm
          title={
            <FormattedMessage
              id="xpack.security.loginPage.xpackUnavailableTitle"
              defaultMessage="Cannot connect to the Elasticsearch cluster currently configured for Kibana."
            />
          }
          message={
            <FormattedMessage
              id="xpack.security.loginPage.xpackUnavailableMessage"
              defaultMessage="To use the full set of free features in this distribution of Kibana, please update Elasticsearch to the default distribution."
            />
          }
        />
      );
    }

    if (layout !== 'form') {
      return (
        <DisabledLoginForm
          title={
            <FormattedMessage
              id="xpack.security.loginPage.unknownLayoutTitle"
              defaultMessage="Unsupported login form layout."
            />
          }
          message={
            <FormattedMessage
              id="xpack.security.loginPage.unknownLayoutMessage"
              defaultMessage="See the Kibana logs for details and try reloading the page."
            />
          }
        />
      );
    }

    const query = parse(window.location.href, true).query;
    return (
      <LoginForm
        http={this.props.http}
        notifications={this.props.notifications}
        selector={selector}
        // @ts-expect-error Map.get is ok with getting `undefined`
        message={messageMap.get(query[LOGOUT_REASON_QUERY_STRING_PARAMETER]?.toString())}
        loginAssistanceMessage={this.props.loginAssistanceMessage}
        loginHelp={loginHelp}
        authProviderHint={query[AUTH_PROVIDER_HINT_QUERY_STRING_PARAMETER]?.toString()}
      />
    );
  };
}

export function renderLoginPage(i18nStart: CoreStart['i18n'], element: Element, props: Props) {
  ReactDOM.render(
    <i18nStart.Context>
      <LoginPage {...props} />
    </i18nStart.Context>,
    element
  );

  return () => ReactDOM.unmountComponentAtNode(element);
}
