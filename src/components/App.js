import Grid from './Grid';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useFormik } from 'formik';
import { Fragment, useCallback, useRef } from 'react';
import { readFile } from 'utils';
import { parse } from 'papaparse';

export default function App() {
  const fileRef = useRef();
  const { values, setFieldValue, setFieldError, handleChange } = useFormik({
    initialValues: {
      columns: 2,
      bomText: '',
      groups: []
    }
  });
  const clearGroups = useCallback(() => {
    setFieldValue('groups', []);
    fileRef.current.value = '';
  }, [setFieldValue, fileRef]);
  const handleSelectFile = useCallback(
    async ({
      target: {
        files: [file]
      }
    }) => {
      try {
        const result = await readFile(file);
        const { data } = parse(result, {
          header: true,
          quoteChar: '"',
          delimiter: ';',
          skipEmptyLines: true
        });

        setFieldValue(
          'groups',
          data.map((row) => ({
            id: row.Id,
            parts: row.Designator.split(','),
            values: [row.Footprint, row.Designation]
          }))
        );
      } catch (error) {
        setFieldError('bomText', 'Invalid file selected.');
      }
    },
    [setFieldError, setFieldValue]
  );

  return (
    <Container fluid>
      <Row>
        <Col xs={3} className="d-print-none">
          <Form>
            <Form.Group classNamy="my-2">
              <Form.Label>Columns</Form.Label>
              <Form.Control
                type="number"
                name="columns"
                min={1}
                max={6}
                step={1}
                onChange={handleChange}
                value={values.columns}
              />
            </Form.Group>
            <Form.Group className="my-2">
              <Form.Label>KiCad BOM (CSV)</Form.Label>
              <Form.Control
                ref={fileRef}
                type="file"
                onChange={handleSelectFile}
              />
            </Form.Group>
            {values.groups.length > 0 && (
              <Fragment>
                <Form.Group className="my-2 d-grid">
                  <Button
                    variant="primary"
                    onClick={() => window.print()}
                    size="lg"
                  >
                    Print
                  </Button>
                </Form.Group>
                <Form.Group className="my-2 d-grid">
                  <Button variant="danger" onClick={clearGroups} size="lg">
                    Reset
                  </Button>
                </Form.Group>
              </Fragment>
            )}
          </Form>
        </Col>
        <Col>
          <Grid {...values} />
        </Col>
      </Row>
    </Container>
  );
}
