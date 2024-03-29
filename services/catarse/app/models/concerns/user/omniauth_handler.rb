# frozen_string_literal: true

module User::OmniauthHandler
  extend ActiveSupport::Concern

  included do
    has_many :oauth_providers, through: :authorizations

    def self.create_from_hash(hash)
      create!(
        {
          public_name: hash['info']['name'],
          name: hash['info']['name'],
          email: hash['info']['email'],
          about_html: (begin
                         hash['info']['description'][0..139]
                       rescue
                         nil
                       end),
          locale: I18n.locale.to_s
        }
      ) do |user|
        # user.remote_uploaded_image_url = "https://graph.facebook.com/#{hash['uid']}/picture?type=large"
      end
    end

    def has_facebook_authentication?
      oauth = OauthProvider.find_by_name 'facebook'
      authorizations.where(oauth_provider_id: oauth.id).present? if oauth
    end

    def facebook_id
      auth = authorizations.joins(:oauth_provider).where("oauth_providers.name = 'facebook'").first
      auth&.uid
    end
  end
end
