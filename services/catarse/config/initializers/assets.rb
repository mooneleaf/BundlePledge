# frozen_string_literal: true
if Rails.env.production?
  Rails.application.config.assets.precompile += %w( api/catarse.js )
end
Rails.application.config.assets.precompile += %w[catarse_bootstrap/fonts.css catarse_bootstrap/catarse.css jquery.js jquery-ui.js analytics.js redactor.css redactor.js jquery/dist/jquery.js jquery-ui/jquery-ui.js]
