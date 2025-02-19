import { isNull } from 'lodash';
import { useEffect, useState } from 'react';
import { BsArrowsCollapse, BsArrowsExpand } from 'react-icons/bs';

import API from '../../../api';
import ErrorBoundary from '../../common/ErrorBoundary';
import Loading from '../../common/Loading';
import styles from './CompareView.module.css';
import DiffTemplate from './DiffTemplate';

interface Props {
  packageId: string;
  values: string | null;
  currentVersion: string;
  comparedVersion: string;
}

const CompareView = (props: Props) => {
  const [diffValues, setDiffValues] = useState<string | null | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);

  useEffect(() => {
    async function getDiffCompareValues(version: string) {
      try {
        setIsLoading(true);
        setIsLoading(true);
        const data = await API.getChartValues(props.packageId, version);
        if (data === props.values) {
          setDiffValues(null);
        } else {
          setDiffValues(data);
        }
      } catch {
        setDiffValues(null);
      } finally {
        setIsLoading(false);
      }
    }

    if (props.comparedVersion !== '') {
      getDiffCompareValues(props.comparedVersion);
    } else {
      setDiffValues('');
    }
  }, [props.comparedVersion]); /* eslint-disable-line react-hooks/exhaustive-deps */

  return (
    <div className={`position-relative h-100 mh-100 border ${styles.templateWrapper}`}>
      {isLoading && <Loading />}
      <div className={`position-absolute d-flex ${styles.wrapper}`}>
        <div className="position-relative">
          <button
            className={`btn btn-sm btn-primary rounded-circle fs-5 ${styles.btn}`}
            onClick={() => {
              setExpanded(!expanded);
            }}
            aria-label={`${expanded ? 'Collapse' : 'Expand'} code`}
            disabled={isNull(diffValues)}
          >
            {expanded ? <BsArrowsCollapse /> : <BsArrowsExpand />}
          </button>
        </div>
      </div>

      <pre className={`text-muted h-100 mh-100 mb-0 overflow-hidden position-relative diffTemplate ${styles.pre}`}>
        {isNull(diffValues) && (
          <div className="d-flex align-items-center justify-content-center h-100 w-100 p-5">
            <div className={`alert alert-dark px-5 py-4 text-center ${styles.alert}`}>
              <span className="text-muted">
                No changes found when comparing version <span className="fw-bold">{props.currentVersion}</span> to{' '}
                <span className="fw-bold">{props.comparedVersion}</span>
              </span>
            </div>
          </div>
        )}
        {diffValues && props.values && (
          <ErrorBoundary className={styles.errorAlert} message="Something went wrong rendering the template.">
            <DiffTemplate
              currentVersion={props.currentVersion}
              diffVersion={props.comparedVersion}
              compareData={diffValues}
              data={props.values}
              expanded={expanded}
            />
          </ErrorBoundary>
        )}
      </pre>
    </div>
  );
};

export default CompareView;
