function EmptyState({
  icon = '📭',
  title = 'Nothing here yet',
  description = 'Get started by creating your first item',
  action = null,
  illustration = null
}) {
  return (
    <div className="empty-state">
      {illustration && (
        <div className="empty-state-illustration">
          {illustration}
        </div>
      )}
      <div className="empty-state-icon">
        {icon}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary"
          style={{ marginTop: '1rem' }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

export default EmptyState
