import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useFormik } from 'formik';
import { Fragment, useCallback, useRef, useState } from 'react';
import { parse } from 'papaparse';
import uniq from 'lodash.uniq';
import { number, object } from 'yup';

import Grid from 'components/Grid';
import { readFile } from 'utils';

const validationSchema = object().shape({
  columns: number()
    .min(1, 'Cannot have less than one column.')
    .max(6, 'Cannot have more than six columns.'),
  height: number().min(100, 'Height cannot be less than 100px.')
});

export default function App() {
  const fileRef = useRef();
  const [groups, setGroups] = useState([]);
  const { values, errors, setFieldError, handleChange } = useFormik({
    initialValues: {
      columns: 2,
      height: 200,
      bomText: ''
    },
    validationSchema
  });
  const resetGroups = useCallback(() => {
    setGroups([]);
    setFieldError('bomText', null);
    fileRef.current.value = '';
  }, [setGroups, setFieldError, fileRef]);
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

        const newGroups = data.map((row) => ({
          id: row.Id,
          parts: row.Designator.split(','),
          values: uniq([row.Footprint, row.Designation])
        }));

        newGroups.forEach((group) =>
          group.parts.sort((a, b) => a.localeCompare(b))
        );

        setGroups(newGroups);
        setFieldError('bomText', null);
      } catch (error) {
        setFieldError('bomText', 'Invalid file selected.');
      }
    },
    [setFieldError, setGroups]
  );
  const handleSortClick = useCallback(() => {
    setGroups((oldGroups) => {
      const newGroups = [...oldGroups];

      newGroups.sort((a, b) => a.parts[0].localeCompare(b.parts[0]));

      return newGroups;
    });
  }, [setGroups]);

  return (
    <Container fluid>
      <Row>
        <Col xs={3} className="d-print-none">
          <Form>
            <Form.Group className="my-2">
              <Form.Label>Columns</Form.Label>
              <Form.Control
                type="number"
                name="columns"
                min={1}
                max={6}
                step={1}
                onChange={handleChange}
                value={values.columns}
                isInvalid={Boolean(errors?.columns)}
              />
              <Form.Control.Feedback type="invalid">
                {errors?.columns}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="my-2">
              <Form.Label>Group Height (px)</Form.Label>
              <Form.Control
                type="number"
                name="height"
                min={100}
                onChange={handleChange}
                value={values.height}
                isInvalid={Boolean(errors?.height)}
              />
              <Form.Control.Feedback type="invalid">
                {errors?.height}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="my-2">
              <Form.Label>KiCad BOM (CSV)</Form.Label>
              <Form.Control
                ref={fileRef}
                type="file"
                name="bomText"
                onChange={handleSelectFile}
                isInvalid={Boolean(errors?.bomText)}
              />
              <Form.Control.Feedback type="invalid">
                {errors?.bomText}
              </Form.Control.Feedback>
            </Form.Group>
            {groups.length > 0 ? (
              <Fragment>
                <Form.Group className="my-2 d-grid">
                  <Button
                    variant="secondary"
                    onClick={handleSortClick}
                    size="lg"
                  >
                    Sort Designators
                  </Button>
                </Form.Group>
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
                  <Button variant="danger" onClick={resetGroups} size="lg">
                    Reset
                  </Button>
                </Form.Group>
              </Fragment>
            ) : (
              <Alert variant="primary">
                <Alert.Heading>Usage</Alert.Heading>
                <p>
                  From KiCad pcbnew, go to File &raquo; Fabrication Outputs
                  &raquo; BOM. Save the CSV somewhere. Then select it using the
                  file picker above.
                </p>
              </Alert>
            )}
          </Form>
        </Col>
        <Col>
          <Grid {...values} groups={groups} />
        </Col>
      </Row>
    </Container>
  );
}
