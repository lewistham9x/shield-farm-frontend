import React from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';

import makeStyles from '@mui/styles/makeStyles';
import styles from './styles';
import { useTranslation } from 'react-i18next';
const useStyles = makeStyles(styles);

export default () => {
  const { chain } = useParams();
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <Link to={`/${chain}`} className={classes.link}>
      <i className={`fas fa-chevron-left ${classes.linkIcon}`} />
      {t('Vaults-Back')}
    </Link>
  );
};
