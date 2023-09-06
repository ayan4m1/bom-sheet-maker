import { Col, Container, Row } from 'react-bootstrap';
import { useFormik } from 'formik';
import { useState } from 'react';
import { number, object } from 'yup';

import Grid from 'components/Grid';
import Sidebar from 'components/Sidebar';

const validationSchema = object().shape({
  columns: number()
    .min(1, 'Cannot have less than one column.')
    .max(6, 'Cannot have more than six columns.'),
  height: number().min(100, 'Height cannot be less than 100px.')
});

export default function App() {
  const [groups, setGroups] = useState([]);
  const formContext = useFormik({
    initialValues: {
      columns: 2,
      height: 200,
      bomText: ''
    },
    validationSchema
  });

  return (
    <Container fluid>
      <Row>
        <Col xs={3} className="d-print-none">
          <Sidebar
            formContext={formContext}
            groups={groups}
            setGroups={setGroups}
          />
        </Col>
        <Col>
          <Grid {...formContext.values} groups={groups} />
        </Col>
      </Row>
    </Container>
  );
}
