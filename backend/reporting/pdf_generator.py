import io
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

def generate_pdf_report(
    test_id: str,
    target_url: str,
    requirement: str,
    objective: str,
    test_type: str,
    load_strategy: str,
    safe_capacity: int,
    degradation_range: str,
    peak_tested: int,
    p50: float,
    p95: float,
    p99: float,
    error_rate: float,
    throughput_rps: float,
    verdict: str,
    verdict_reason: str,
    executive_summary: str,
    facts: list[str],
    observations: list[str],
    possible_causes: list[str],
    recommendations: list[str],
    correlated_events: list[dict] = None
) -> bytes:
    """
    Generates a comprehensive, professional PDF performance test report using ReportLab.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#0f172a'),
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#475569'),
    )
    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#1e293b'),
        spaceBefore=14,
        spaceAfter=6,
    )
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#334155'),
    )
    bold_body_style = ParagraphStyle(
        'BoldBodyCustom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#1e293b'),
    )
    bullet_style = ParagraphStyle(
        'BulletCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155'),
        leftIndent=15,
        firstLineIndent=-10,
    )

    story = []

    # Title & Header
    story.append(Paragraph("TestPilot AI · Performance Test Report", title_style))
    story.append(Paragraph("Autonomous Website Performance Testing Platform", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#4f46e5'), spaceAfter=14))

    # Meta Overview Table
    meta_data = [
        [Paragraph("<b>Test Run ID:</b>", body_style), Paragraph(test_id, bold_body_style),
         Paragraph("<b>Final Verdict:</b>", body_style), Paragraph(f"<b>{verdict}</b>", bold_body_style)],
        [Paragraph("<b>Target Endpoint:</b>", body_style), Paragraph(target_url, body_style),
         Paragraph("<b>Strategy / Type:</b>", body_style), Paragraph(f"{load_strategy.title()} ({test_type})", body_style)],
        [Paragraph("<b>Safe Capacity:</b>", body_style), Paragraph(f"~{safe_capacity} VUs", bold_body_style),
         Paragraph("<b>Degradation Range:</b>", body_style), Paragraph(degradation_range, body_style)],
    ]
    meta_table = Table(meta_data, colWidths=[110, 160, 110, 150])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # Requirement & Verdict
    story.append(Paragraph("Requirement Verdict", h1_style))
    story.append(Paragraph(f"<b>Natural Language Requirement:</b> <i>\"{requirement}\"</i>", body_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph(f"<b>Objective:</b> {objective}", body_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph(f"<b>Verdict Explanation:</b> {verdict_reason}", body_style))
    story.append(Spacer(1, 12))

    # Telemetry Scorecard Table
    story.append(Paragraph("Measured Performance Scorecard", h1_style))
    kpi_data = [
        ["Peak Tested", "Safe Capacity", "P50 Latency", "P95 Latency", "P99 Latency", "Error Rate", "Throughput"],
        [f"{peak_tested} VUs", f"~{safe_capacity} VUs", f"{p50} ms", f"{p95} ms", f"{p99} ms", f"{error_rate:.2f}%", f"{throughput_rps:,.0f} RPS"]
    ]
    kpi_table = Table(kpi_data, colWidths=[76, 76, 76, 76, 76, 76, 76])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e1b4b')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#f1f5f9')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94a3b8')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(kpi_table)
    story.append(Spacer(1, 12))

    # Executive Summary
    story.append(Paragraph("Executive Summary", h1_style))
    for para in executive_summary.split("\n\n"):
        story.append(Paragraph(para, body_style))
        story.append(Spacer(1, 4))
    story.append(Spacer(1, 8))

    # Facts vs Observations vs Possible Causes
    story.append(Paragraph("AI Performance Doctor: Diagnostic Findings", h1_style))
    
    story.append(Paragraph("<b>1. Measured Facts (Telemetry Truths):</b>", bold_body_style))
    for f in facts:
        story.append(Paragraph(f"• {f}", bullet_style))
    story.append(Spacer(1, 6))

    story.append(Paragraph("<b>2. Observations (Empirical Behavioral Patterns):</b>", bold_body_style))
    for o in observations:
        story.append(Paragraph(f"• {o}", bullet_style))
    story.append(Spacer(1, 6))

    story.append(Paragraph("<b>3. Possible Causes (AI-Generated Hypotheses):</b>", bold_body_style))
    for c in possible_causes:
        story.append(Paragraph(f"• {c}", bullet_style))
    story.append(Spacer(1, 6))

    story.append(Paragraph("<b>4. Recommended Remediation Actions:</b>", bold_body_style))
    for r in recommendations:
        story.append(Paragraph(f"• {r}", bullet_style))
    story.append(Spacer(1, 10))

    # Correlated Events
    if correlated_events:
        story.append(Paragraph("Correlated Performance Events", h1_style))
        for ce in correlated_events:
            ev_box = [
                [Paragraph(f"<b>Event: {ce.get('title', 'Performance Alert')}</b> (Confidence: {ce.get('confidence', 'High')})", bold_body_style)],
                [Paragraph("<b>Trigger Signals:</b> " + "; ".join(ce.get('signals', [])), body_style)]
            ]
            ev_table = Table(ev_box, colWidths=[530])
            ev_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#fef3c7')),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#f59e0b')),
                ('TOPPADDING', (0,0), (-1,-1), 6),
                ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ]))
            story.append(ev_table)
            story.append(Spacer(1, 8))

    # Footer note
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#cbd5e1'), spaceAfter=8))
    story.append(Paragraph("Generated autonomously by TestPilot AI Performance Engine · Safe Synthetic Telemetry Audit", subtitle_style))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
