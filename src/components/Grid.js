import PropTypes from 'prop-types';
import { Container, Row, Col } from 'react-bootstrap';

export default function Grid({ groups, columns = 2, height = 200 }) {
  const colWidth = Math.ceil(12 / columns);

  if (groups.length === 0) {
    return null;
  }

  return (
    <Container fluid className="bom-grid">
      <Row>
        {groups.map((group) => (
          <Col
            xs={colWidth}
            key={group.id}
            className="bom-grid-cell"
            style={{ minHeight: height }}
          >
            <h2 className="my-0">{group.parts.join(', ')}</h2>
            {group.values
              .filter((value) => Boolean(value))
              .map((value) => (
                <p className="my-2" key={value}>
                  {value}
                </p>
              ))}
          </Col>
        ))}
      </Row>
    </Container>
  );
}

Grid.propTypes = {
  groups: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.number,
  height: PropTypes.number
};
