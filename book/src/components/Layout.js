import React from 'react';
import { useLocation } from '@docusaurus/router';
import { useBaseUrlUtils } from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useWindowSize from '@docusaurus/useWindowSize';

function Layout(props) {
  const { children, ...layoutProps } = props;
  const { siteConfig } = useDocusaurusContext();
  const { withBaseUrl } = useBaseUrlUtils();
  const location = useLocation();

  return (
    <div className="container">
      {children}
    </div>
  );
}

export default Layout;