import React, { useEffect, useRef, useState } from 'react';
import { i18n } from '@kbn/i18n';
import { FormattedMessage, I18nProvider } from '@kbn/i18n/react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import {
  EuiButton,
  EuiHorizontalRule,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageContentHeader,
  EuiPageHeader,
  EuiTitle,
  EuiText,
  EuiFieldNumber,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormControlLayout,
  EuiFormLabel,
  EuiFormRow,
  EuiSelect,
  EuiSpacer,
} from '@elastic/eui';

import { CoreStart } from '../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';

import DataTable from './SchedulesTable';
import Swal from 'sweetalert2';
interface ScheduledReportsAppDeps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
}

export const ScheduledReportsApp = ({
  basename,
  notifications,
  http,
  navigation,
}: ScheduledReportsAppDeps) => {
  const options = [
    { value: 'second', text: 'Seconds' },
    { value: 'hour', text: 'Hours' },
    { value: 'day', text: 'Days' },
    { value: 'month', text: 'Months' },
  ];

  const timeFilterOptions = [
    { value: 'hour', text: 'Hours' },
    { value: 'day', text: 'Days' },
    { value: 'month', text: 'Months' },
  ];
  const [duration, setDuration] = useState(1);
  const [timeFilter, setTimeFilter] = useState(1);
  const [selectedValue, setSelectedValue] = useState(options[2].value);
  const [timeFilterselectedValue, setTimeFilterSelectedValue] = useState(options[2].value);
  const [receiver, setReceiver] = useState('');

  const index = localStorage.getItem('index');
  // localStorage.removeItem('index');
  const id = localStorage.getItem('id');
  // localStorage.removeItem('id');
  const title = localStorage.getItem('title');
  // localStorage.removeItem('title');
  const request = localStorage.getItem('request');
  // localStorage.removeItem('request');
  const columns = localStorage.getItem('columns');

  // const [page, setPage] = useState(id ? 'form' : 'list');
  const onChangeSelect = (e: { target: { value: React.SetStateAction<string> } }) => {
    setSelectedValue(e.target.value);
  };
  const onChangeTimeFilter = (e: { target: { value: React.SetStateAction<number> } }) => {
    setTimeFilter(e.target.value);
  };

  const onChangeTimeFilterOption = (e: { target: { value: React.SetStateAction<string> } }) => {
    setTimeFilterSelectedValue(e.target.value);
  };

  const onChangeDuration = (e: { target: { value: React.SetStateAction<number> } }) => {
    setDuration(e.target.value);
  };

  const onChangeReceiver = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReceiver(e.target.value);
  };

  const onClickHandler = () => {
    setIsSaving(true);
    console.log(columns);
    const requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'kbn-xsrf': 'reporting' },
      body: JSON.stringify({
        index: index,
        visualizationId: id,
        title,
        request,
        duration,
        durationUnit: selectedValue,
        receiver,
        timeFilter,
        timeFilterUnit: timeFilterselectedValue,
        columns,
      }),
    };
    fetch('/api/scheduled_reports/create', requestOptions).then((response) => {
      if (response.ok) {
        Swal.fire(
          'Success!',
          'Your scheduled report has been created successfully.',
          'success'
        ).then(function () {
          window.location.href = '../scheduledReports/';
        });
      } else {
        setIsSaving(false);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Something went wrong, please try again!',
        });
      }
    });
  };

  const [isSaving, setIsSaving] = useState(false);

  // Render the application DOM.
  return (
    <Router basename={basename}>
      <I18nProvider>
        <EuiPage restrictWidth="1000px">
          <EuiPageBody>
            <EuiPageHeader>
              <EuiTitle size="l">
                <h1>
                  <FormattedMessage
                    id="reportScheduler.helloWorldText"
                    defaultMessage="{name}"
                    values={{ name: 'Sceduled Reports' }}
                  />
                </h1>
              </EuiTitle>
            </EuiPageHeader>
            <Switch>
              <Route path="/create">
                <EuiPageContent>
                  <EuiPageContentHeader>
                    <EuiTitle>
                      <h2>
                        <FormattedMessage
                          id="reportScheduler.congratulationsTitle"
                          defaultMessage="Fill the fileds with the required data to start scheduling!"
                        />
                      </h2>
                    </EuiTitle>
                  </EuiPageContentHeader>
                  <EuiPageContentBody>
                    <EuiText>
                      <EuiHorizontalRule />
                      <EuiFormControlLayout
                        readOnly
                        prepend={<EuiFormLabel htmlFor="title">Visualization Name</EuiFormLabel>}
                      >
                        <input
                          type="text"
                          className="euiFieldText euiFieldText--inGroup"
                          id="title"
                          value={title?.toString()}
                          readOnly
                        />
                      </EuiFormControlLayout>
                      <EuiSpacer size="m" />
                      <EuiFormControlLayout
                        readOnly
                        prepend={<EuiFormLabel htmlFor="reciever">Receiver Email</EuiFormLabel>}
                      >
                        <input
                          type="email"
                          className="euiFieldText euiFieldText--inGroup"
                          id="reciever"
                          placeholder="ex: mail@domain.com"
                          onChange={(e) => onChangeReceiver(e)}
                        />
                      </EuiFormControlLayout>
                      <EuiSpacer size="m" />
                      <EuiFlexGroup style={{ maxWidth: 600 }}>
                        <EuiFlexItem>
                          <EuiFormRow>
                            <EuiFormControlLayout
                              readOnly
                              prepend={<EuiFormLabel htmlFor="period">Report Every</EuiFormLabel>}
                            >
                              <EuiFieldNumber
                                placeholder="Enter the value of the duration"
                                value={duration}
                                onChange={(e: any) => onChangeDuration(e)}
                                aria-label="Use aria labels when no actual label is in use"
                              />
                            </EuiFormControlLayout>
                          </EuiFormRow>
                        </EuiFlexItem>
                        <EuiFlexItem grow={false} style={{ width: 120 }}>
                          <EuiFormRow>
                            <EuiSelect
                              id="selectDocExample"
                              options={options}
                              value={selectedValue}
                              onChange={(e: { target: { value: React.SetStateAction<string> } }) =>
                                onChangeSelect(e)
                              }
                              aria-label="Use aria labels when no actual label is in use"
                            />
                          </EuiFormRow>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                      <EuiSpacer size="m" />
                      <EuiFlexGroup style={{ maxWidth: 600 }}>
                        <EuiFlexItem>
                          <EuiFormRow>
                            <EuiFormControlLayout
                              readOnly
                              prepend={
                                <EuiFormLabel htmlFor="period">Retrive data from last</EuiFormLabel>
                              }
                            >
                              <EuiFieldNumber
                                placeholder="Enter the value of Time Filter"
                                value={timeFilter}
                                onChange={(e: {
                                  target: { value: React.SetStateAction<number> };
                                }) => onChangeTimeFilter(e)}
                                aria-label="Use aria labels when no actual label is in use"
                              />
                            </EuiFormControlLayout>
                          </EuiFormRow>
                        </EuiFlexItem>
                        <EuiFlexItem grow={false} style={{ width: 120 }}>
                          <EuiFormRow>
                            <EuiSelect
                              id="selectDocExample"
                              options={timeFilterOptions}
                              value={timeFilterselectedValue}
                              onChange={(e: { target: { value: React.SetStateAction<string> } }) =>
                                onChangeTimeFilterOption(e)
                              }
                              aria-label="Use aria labels when no actual label is in use"
                            />
                          </EuiFormRow>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                      <EuiSpacer size="m" />
                      <EuiButton
                        type="primary"
                        size="s"
                        onClick={onClickHandler}
                        isLoading={isSaving}
                      >
                        <FormattedMessage
                          id="reportScheduler.buttonText"
                          defaultMessage="Create Report Scheduler"
                        />
                      </EuiButton>
                    </EuiText>
                  </EuiPageContentBody>
                </EuiPageContent>
              </Route>
              <Route path="/">
                <EuiPageContent>
                  <EuiPageContentHeader>
                    <EuiTitle>
                      <h2>
                        <FormattedMessage
                          id="reportScheduler.congratulationsTitle"
                          defaultMessage="Preview and control your scheduled reports!"
                        />
                      </h2>
                    </EuiTitle>
                  </EuiPageContentHeader>
                  <EuiPageContentBody>
                    <EuiText>
                      <EuiHorizontalRule />
                      <DataTable
                        notifications={notifications}
                        // scheduledReports={scheduledReports}
                        // deleteAction={removeScheduledReport}
                      ></DataTable>
                    </EuiText>
                  </EuiPageContentBody>
                </EuiPageContent>
              </Route>
            </Switch>
          </EuiPageBody>
        </EuiPage>
      </I18nProvider>
    </Router>
  );
};
