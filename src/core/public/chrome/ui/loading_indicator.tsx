/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { EuiLoadingSpinner, EuiProgress } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import React from 'react';
import classNames from 'classnames';
import { Subscription } from 'rxjs';

import { HttpStart } from '../../http';

export interface LoadingIndicatorProps {
  loadingCount$: ReturnType<HttpStart['getLoadingCount$']>;
  showAsBar?: boolean;
}

export class LoadingIndicator extends React.Component<LoadingIndicatorProps, { visible: boolean }> {
  public static defaultProps = { showAsBar: false };

  private loadingCountSubscription?: Subscription;

  state = {
    visible: false,
  };

  private timer: any;
  private increment = 1;

  componentDidMount() {
    this.loadingCountSubscription = this.props.loadingCount$.subscribe((count) => {
      if (this.increment > 1) {
        clearTimeout(this.timer);
      }
      this.increment += this.increment;
      this.timer = setTimeout(() => {
        this.setState({
          visible: count > 0,
        });
      }, 250);
    });
  }

  componentWillUnmount() {
    if (this.loadingCountSubscription) {
      clearTimeout(this.timer);
      this.loadingCountSubscription.unsubscribe();
      this.loadingCountSubscription = undefined;
    }
  }

  render() {
    const className = classNames(!this.state.visible && 'kbnLoadingIndicator-hidden');

    const testSubj = this.state.visible
      ? 'globalLoadingIndicator'
      : 'globalLoadingIndicator-hidden';

    const ariaHidden = this.state.visible ? false : true;

    const ariaLabel = i18n.translate('core.ui.loadingIndicatorAriaLabel', {
      defaultMessage: 'Loading content',
    });

    const logo = this.state.visible ? (
      <EuiLoadingSpinner
        size="l"
        data-test-subj={testSubj}
        aria-hidden={false}
        aria-label={ariaLabel}
      />
    ) : (
      <img
        src="data:image/png;base64,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"
        alt="logo"
        width="24"
        height="24"
      />
    );

    return !this.props.showAsBar ? (
      logo
    ) : (
      <EuiProgress
        className={className}
        data-test-subj={testSubj}
        aria-hidden={ariaHidden}
        aria-label={ariaLabel}
        position="fixed"
        color="accent"
        size="xs"
      />
    );
  }
}
