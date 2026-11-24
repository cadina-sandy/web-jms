import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  BorderStyle, Document, HeadingLevel, Packer, Paragraph, SectionType,
  Table, TableCell, TableLayoutType, TableRow, TextRun, WidthType,
} from 'docx';
import { enrollmentDate, enrollmentName, enrollmentSections, type EnrollmentRecord } from './view';

const pageWidth = 12240;
const pageHeight = 15840;
const margin = 567;
const contentWidth = pageWidth - margin * 2;
const border = { style: BorderStyle.SINGLE, color: 'E3E8EE', size: 2 };
const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };

function text(value: string, role: 'answer' | 'label' | 'heading' = 'answer') {
  return new TextRun({
    text: value, size: 21,
    font: role === 'heading' ? 'Inter ExtraBold' : role === 'label' ? 'Inter SemiBold' : 'Inter',
    color: role === 'heading' ? '1B3559' : role === 'label' ? '48566A' : '536074',
  });
}

function entry(label: string, value: string) {
  return new Paragraph({
    spacing: { before: 0, after: 0, line: 260 },
    children: [text(label + ' ', 'label'), text(value)],
  });
}

function sectionTable(title: string, entries: ReturnType<typeof enrollmentSections>[number]['entries']) {
  const rows: TableRow[] = [
    new TableRow({
      cantSplit: true,
      children: [new TableCell({
        columnSpan: 2, width: { size: contentWidth, type: WidthType.DXA },
        shading: { fill: 'EEF2F6' },
        margins: { top: 40, bottom: 40, left: 85, right: 85 },
        borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
        children: [new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 0, after: 0, line: 260 }, keepNext: true,
          children: [text(title, 'heading')],
        })],
      })],
    }),
  ];
  for (let index = 0; index < entries.length; index += 2) {
    const pair = entries.slice(index, index + 2);
    rows.push(new TableRow({
      cantSplit: true,
      children: [0, 1].map(column => new TableCell({
        width: { size: contentWidth / 2, type: WidthType.DXA },
        margins: { top: 26, bottom: 26, left: 85, right: 85 },
        borders: { top: noBorder, bottom: border, left: noBorder, right: column === 0 ? border : noBorder },
        children: [pair[column] ? entry(pair[column].label, pair[column].value) : new Paragraph({ spacing: { after: 0 } })],
      })),
    }));
  }
  return new Table({
    width: { size: contentWidth, type: WidthType.DXA },
    columnWidths: [contentWidth / 2, contentWidth / 2], layout: TableLayoutType.FIXED,
    borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideHorizontal: noBorder, insideVertical: noBorder },
    rows,
  });
}

export async function enrollmentWord(records: EnrollmentRecord[]) {
  const [regular, semibold, extrabold] = await Promise.all([
    readFile(join(process.cwd(), 'lib/matricula/fonts/Inter-Regular.ttf')),
    readFile(join(process.cwd(), 'lib/matricula/fonts/Inter-SemiBold.ttf')),
    readFile(join(process.cwd(), 'lib/matricula/fonts/Inter-ExtraBold.ttf')),
  ]);
  const doc = new Document({
    creator: 'Escuela Julio Montt Salamanca',
    title: 'Fichas de matrícula 2027',
    styles: {
      default: { document: { run: { font: 'Inter', size: 21, color: '536074' }, paragraph: { spacing: { after: 0, line: 260 } } } },
      paragraphStyles: [
        { id: 'Title', name: 'Title', basedOn: 'Normal', next: 'Normal', run: { font: 'Inter ExtraBold', size: 36, color: '1B3559' }, paragraph: { spacing: { after: 40 }, keepNext: true } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', run: { font: 'Inter ExtraBold', size: 21, color: '1B3559' }, paragraph: { spacing: { after: 0 }, keepNext: true } },
      ],
    },
    fonts: [
      { name: 'Inter', data: regular },
      { name: 'Inter SemiBold', data: semibold },
      { name: 'Inter ExtraBold', data: extrabold },
    ],
    sections: records.map(record => ({
      properties: {
        type: SectionType.NEXT_PAGE,
        page: { size: { width: pageWidth, height: pageHeight }, margin: { top: margin, bottom: margin, left: margin, right: margin } },
      },
      children: [
        new Paragraph({ style: 'Title', children: [new TextRun({ text: 'Ficha de matrícula 2027', font: 'Inter ExtraBold', size: 36, color: '1B3559' })] }),
        new Paragraph({ spacing: { after: 120 }, keepNext: true, children: [text('Escuela Julio Montt Salamanca', 'label')] }),
        new Paragraph({ spacing: { after: 30 }, keepNext: true, children: [text('Estudiante ', 'label'), text(enrollmentName(record))] }),
        new Paragraph({ spacing: { after: 30 }, keepNext: true, children: [
          text('Fecha de matrícula ', 'label'), text(enrollmentDate(record.fechaMatricula ?? '')),
          text('   Curso 2027 ', 'label'), text(record.curso ?? ''),
        ] }),
        new Paragraph({ spacing: { after: 130 }, keepNext: true, children: [text('Comprobante ', 'label'), text(record.id)] }),
        ...enrollmentSections(record).flatMap(section => [
          sectionTable(section.title, section.entries),
          new Paragraph({ spacing: { before: 0, after: 0, line: 50 }, children: [new TextRun({ text: '', size: 2 })] }),
        ]),
      ],
    })),
  });
  return Packer.toBuffer(doc);
}
