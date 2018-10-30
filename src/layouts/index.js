import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import ImportedBaseLayout from './BaseLayout';
import ImportedHeaderedLayout from './HeaderedLayout';
import ImportedFooteredLayout from './FooteredLayout';
import ImportedSidebarredLayout from './SidebarredLayout';
import ImportedLocationCardLayout from './LocationCardLayout';

export const BaseLayout = ImportedBaseLayout;
export const HeaderedLayout = ImportedHeaderedLayout;
export const FooteredLayout = ImportedFooteredLayout;
export const SidebarredLayout = ImportedSidebarredLayout;
export const LocationCardLayout = ImportedLocationCardLayout;

/**
 * Higher Order Component to provide Layouts with a children map
 * @param {PureComponent} LayoutComponent The Layout Component use in the composition
 * @param {String} datasetLabel The dataset label to use
 * @returns {PureComponent} The composed component
 */
export function withLabeledChildren (LayoutComponent, datasetLabel) {
  class ComposedLayout extends PureComponent {
    render () {
      const { children: childrenFromProps, ...passThroughProps } = this.props;
      const childrenToProcess = !Array.isArray(childrenFromProps) ? [childrenFromProps] : childrenFromProps;
      const childrenMap = {};
      if (typeof datasetLabel === 'string' && datasetLabel.length !== 0) {
        childrenToProcess.map(child => {
          if (child && child.props) {
            childrenMap[child.props[`data-${datasetLabel}`]] = child;
          }
        });
      }
      return <LayoutComponent childrenMap={childrenMap} {...passThroughProps} />;
    }
  };

  ComposedLayout.propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.arrayOf(PropTypes.element)
    ]).isRequired
  };

  return ComposedLayout;
};
