'use strict';

angular
  .module('distill.controllers.qs', [])
  .controller('QuickScheduleCtrl', ['$scope', '$rootScope', '$window', 'ipCookie', '$location', '$timeout', '$http', '$filter',
    function factory($scope, $rootScope, $window, ipCookie, $location, $timeout, $http, filter){
      var URL = 'http://0.0.0.0:3000',
      /**
       * Shared interview config options
       * @type {Object}
       */
      interviewConfig = {
        media_type: 0,
        quickDuration: 0,
        attachments: []
      },
      panelConfig = {
        interviews: [ interviewConfig ]
      },
      /**
       * The error handler for failed AJAX calls
       * @param  {Object} data The response data
       */
      error = function(data){
        var message = 'Error #' + data.status + ': ';

        if(data.status == 500){
          message += 'Interview couldn\'t be scheduled';
        }
        else if(data.status == 401){
          message += "Not logged in: try <a href=\".\">reloading this page</a>";
        }
        else{
          message += data.data.error ? data.data.error[0] : data.data;
        }

        // Notification.error(message);
        // ToDo (Sergio): Making this more visible...
        console.log('ERROR', message);

        $scope.saving = false;
      },
      /**
       * Updates the interview object with the attached files
       * @param {String} interviewId The interview id
       */
      saveAttachments = function(){
        angular.forEach($scope.attachments, function(attachment){
          $scope.newPanel.interviews[0].attachments.push({
            name:      attachment.filename,
            writable:  attachment.isWriteable,
            key:       attachment.key,
            mime_type: attachment.mimetype,
            size:      attachment.size,
            url:       attachment.url,
            private:   true,
            source:    'filepicker'
          });
        });
      },
      /**
       * Parser for select results format
       *
       * The format must be => { results: [{ id: "0123", text: "lorem ipsum" }] }
       * The shouldn't be required in the future. We need to modify seach to support
       * the correct structure.
       */
      parseSearch = function(data, idName, textName, typeName){
        var d,
            results = [],
            parse = function(elem, idName, textName, typeName) {
              idName = idName || 'id';
              textName = textName || 'name';
              typeName = typeName || 'type';

              var result = {
                id: elem[idName],
                text: elem[textName] || elem.email,
                type: elem[typeName] || 'user'
              };

              result.name = result.name || result.text; // hack

              if(elem.email)
                result.email = elem.email;

              if(elem.email_hash)
                result.email_hash = elem.email_hash;

              if(elem.message)
                result.message = elem.message;

              // groups case
              if(elem.color){
                result.color = elem.color;
                result.type  = 'group';
              }

              return result;
            };

        if(angular.isArray(data))
          angular.forEach(data, function(elem){
            results.push(parse(elem, idName, textName, typeName));
          });
        else
          results = parse(data, idName, textName, typeName);

        return results;
      },
      /**
       * Returns a new date object
       * @param  {Object} date     The start date
       * @param  {Number} duration The interview duration
       * @return {Object}          The new end date/time object
       */
      setDuration = function(date, duration){
        if($.type(date) != 'date' || !$.isNumeric(duration))
          return date;

        return new Date(date.getTime() + parseInt(duration, 10) * 60000);
      },
      setTime = function(date, time){
        if($.type(date) != 'date' || $.type(time) != 'string')
          return;

        date.setHours(time.substr(0,2));
        date.setMinutes(time.substr(2));
      },
      /**
       * Success callback for interview creation
       * @param {Object} data The response data
       */
      successCreating = function(resource){
        var interview = resource.interviews[0];

        $scope.saving = false;
        $scope.showInstructions = true;

        $scope.interviewLink = location.protocol + '//' + location.hostname + interview.path_with_name;

        $scope.newPanel = resource;

        if(resource.job_role)
          $http.get(URL + '/api/v1/job_roles/' + resource.job_role.id)
            .success(function(role){
              $scope.jobRole = role;
            });


        if($scope.newPanel.candidate_email)
          $scope.newPanel.email_candidate = true;

        if($scope.newPanel.interviews[0].interviewer)
          $scope.newPanel.email_interviewer = true;

        $rootScope.$emit('StackCtrl:updateStacks', $scope.newPanel);
      };

      /*-------------------------------------
        Controller helper properties
       -------------------------------------*/

      angular.extend($scope, {
        // uploaded files
        attachments: [],
        /**
         * Listens for return/enter keypress to close form
         * @param {Object} event The event object
         */
        checkKeyCode: function(event){
          if(event.keyCode == 13){
            $scope.create();
            event.target.blur();
          }
        },
        googleApps: $rootScope.googleAppsEnabled,
        // duration of interview (quick scheduling)
        duration: null,
        // if the organization has google apps synced
        hasGoogleApps: null,
        // advanced options flag
        hideAdvanced: true,
        // check if filepicker is available
        hasFilepicker: $window.filepicker,
        // unique url hash passed up from the backend
        interviewLink: '{{ interview link will appear here once scheduled }}',
        // interviewer selection config
        interviewersSelect: {
          minimumInputLength: 0,
          allowClear: true,
          placeholder: "Select interviewer...",
          ajax: {
            url: URL + "/api/v1/interviewers",
            data: function (term, page){
              return { q: term };
            },
            results: function (data, page){
              return { results: parseSearch(data) };
            }
          },
          formatResult: function(name){
            var subtitle = name.email,
                style    = 'background: url(https://secure.gravatar.com/avatar/' + name.email_hash + '?s=64&d=https://distill-static.s3.amazonaws.com/images/defaultavatar.png) no-repeat center center;',
                gravatar = '<img class="gravatar" src="data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" style="' + style + '">';

            return '<div>' + gravatar + name.text + '</div><div class="pl20"><span class="email">' + subtitle + '</span></div>';
          }
        },
        // new quick schedule object
        newPanel: angular.extend({}, panelConfig),
        // role selection config
        rolesSelect: {
          minimumInputLength: 0,
          allowClear: true,
          placeholder: 'Select title...',
          ajax: {
            url: URL + '/api/v1/job_roles/search',
            data: function (term, page){
              return { q: term };
            },
            results: function (data, page){
              return { results: parseSearch(data, 'id', 'title') };
            }
          },
          initSelection : function(element, callback){
            if($scope.panel.job_role)
              callback($scope.panel.job_role);
          }
        },
        // quick scheduling flag (true -> show)
        showQuickScheduling: false,
        // instructional flag (true -> show)
        showInstructions: false,
        /**
         * Time drop-down config
         * @type {Object}
         */
        timeConfig: {
          allowClear: true,
          placeholder: '9:00 AM',
          dropdownCss: function(){
            if(!$scope.newPanel.quick_time){
              $scope.newPanel.quick_time = '0900';
              $scope.$apply();
            }
          }
        },
        /*
         * Toggles "More Options" panel
         * @return {Boolean} True or false value
         */
        toggleAdvanced: function(){
          $scope.hideAdvanced = !$scope.hideAdvanced;
          return $scope.hideAdvanced;
        },
        /**
         * Generates our time interval list
         * @return {Object} Hash of time slots
         */
        time_intervals: (function(){
          var d = (new Date(2000,0,0)).getTime(),
              timeints = {}, i, td, td_string;

          for(i = 0; i < 96; i++){
            td = new Date(d + i * 900000);
            timeints[''+filter('date')(td,'HHmm')] = filter('date')(td,'shortTime');
          }

          return timeints;
        }()),
        // our start time
        time: null,
        // saving flag
        saving: false
      });

      /*-------------------------------------
        Public methods
       -------------------------------------*/

      angular.extend($scope, {
        /**
         * Saves the current interview configuration
         * @return {Function} Success callback
         */
        create: function(){
          var error,
              errorField,
              interviewer,
              invalidInterviewerEmailDomain,
              message,
              messageSpan,
              panel;

          this.quickSchedForm.errorOn = {};

          // If interviewer wasn't selected, we assume the email domain is valid (empty)
          invalidInterviewerEmailDomain = $scope.newPanel.interviewer && !$scope.emailDomainValid($scope.newPanel.interviewer.email) || false;

          if(!this.quickSchedForm.$valid || invalidInterviewerEmailDomain){
            error = $('#ui-custom-alert');
            messageSpan = $('#ui-custom-alert span');

            if(!this.quickSchedForm.candidateName.$valid){
              message = 'Please provide the candidate\'s name.';
              errorField = 'candidateName';
            }
            else if(!this.quickSchedForm.candidateEmail.$valid){
              message = 'Candidate email is invalid.';
              errorField = 'candidateEmail';
            }
            else if(!this.quickSchedForm.interviewer.$valid){
              message = 'Interviewer email is invalid';
              errorField = 'interviewer';
            }
            else if(invalidInterviewerEmailDomain){
              var domains = $scope.validDomains().join(' or ');
              message = 'Interviewer email must end in ' + domains + '.';
              errorField = 'interviewer';
              $scope.newPanel.interviewer = null;
            }

            if(errorField){
              this.quickSchedForm.errorOn[errorField] = true;
            }

            messageSpan.text(message);

            error.addClass('show');

            $timeout(function(){
              error.removeClass('show');
            }, 1800);

            return;
          }

          $scope.saving = true;

          panel = $scope.newPanel;
          panel.source = 'quick';
          panel.time_zone = $window.timezones.determine().name();

          if(panel.interviewer){
            if(panel.interviewer.id)
              panel.interviews[0].interviewer_id = panel.interviewer.id;
            else
              panel.interviews[0].interviewer_email = panel.interviewer.email;
          }
          else if (panel.interviewer_email){
            panel.interviews[0].interviewer_email = panel.interviewer_email;
          }
          else{
            // default requirement for quick sched
            panel.interviews[0].requirements = [{ type: 'Group', id: 'all' }];
          }

          saveAttachments();

          return $http.post(URL + '/api/v1/panels').success(successCreating).error(error);
        },
        primaryDomain: function(){
          return $rootScope.user.email.split('@')[1];
        },
        validDomains: function(){
          return $rootScope.organization.domains;
        },
        /**
         * Checks interviewer email domain against current org domain
         */
        emailDomainValid: function(email){
          var emailDomain = email.split('@')[1];
          return _.any($scope.validDomains(), function(domain){
            return domain == emailDomain;
          });
        },
        /**
         * Creates the filepicker widget
         */
        picker: function(){
          var input = $('<input class="filepicker" id="addresumebtn" data-fp-store-container="'+$window.inkContainer+'" data-fp-apikey="' + $window.inkAPIKey + '" data-fp-button-class="btn small" data-fp-button-text="Attach Resume" data-fp-maxsize="20971520" name="attachment" type="filepicker">'),
              btn = $('#addresume');

          if(!$('#addresumebtn').length){
            btn.append(input);
            filepicker.constructWidget(input);
            $scope.listen(input);
          }
        },
        /**
         * Listens for change event of filepicker selection
         * @param {Object} picker jQuery object
         */
        listen: function(picker){
          picker.on('change', function(e){
            $scope.attachments.push(e.originalEvent.fpfiles[0]);
            $scope.$apply();
          });
        },
        /**
         * Removes the file from the interview
         * @param {Object} attachment The file data
         */
        remove: function(attachment){
          $scope.attachments = _.reject($scope.attachments, function(e){
            return e.url === attachment.url;
          });

          $scope.$apply();
        },
        /**
         * Cleans up quick scheduling forms
         */
        sanitize: function(){
          $rootScope.$broadcast('QuickSchedule:hideQuickSchedule');
          $('#send_invite').prop('checked', false);
          $('#flashcopy').empty().remove();
          $('#clip_button').data('zc-activated', false).text('Copy to clipboard');
          $scope.attachments = [];
          $scope.duration = 0;
          $scope.hideAdvanced = true;
          $scope.showConfirmation = $scope.showInstructions = $scope.showQuickScheduling = false;
          $scope.newPanel = angular.extend({}, panelConfig);
        },
        /**
         * Confirm and send email to one or more parties
         */
        send: function(){
          var config = {
            email_content: $scope.newPanel.email_content,
            id: $scope.newPanel.id,
            type: 'prep'
          };

          if($scope.newPanel.email_candidate && !$scope.newPanel.email_interviewer)
            config.prep_target = 'candidate';

          if($scope.newPanel.email_interviewer && !$scope.newPanel.email_candidate)
            config.prep_target = 'interviewer';

          Panel.sendEmail(config);

          $scope.showInstructions = false;
          $scope.showConfirmation = true;
        },
        /**
         * Show/Hide quick scheduling
         * @return {Boolean} True or false value
         */
        toggleQuickSchedule: function(){
          var route = $location.path().indexOf('stacks') !== -1 && $location.path().indexOf('interviews') !== -1;

          if(!route){
            $scope.showQuickScheduling = !$scope.showQuickScheduling;

            if($scope.showQuickScheduling && !$scope.showInstructions){
              if($scope.hasFilepicker)
                $scope.picker();
            }
          }
          else
            $scope.showQuickScheduling = false;

          return $scope.showQuickScheduling;
        }
      });

      /*-------------------------------------
        Google apps integration watchers
       -------------------------------------*/

      var usingGoogleApps = function(googleApps){
        return googleApps && googleApps.organization;
      };
      var needsGoogleAuth = function(googleApps){
        return usingGoogleApps(googleApps) && !googleApps.uid;
      };

      $scope.$watch('user.integration_status', function(integrationStatus){

        if(!ipCookie('google_connect_prompt') && integrationStatus && needsGoogleAuth(integrationStatus.google_apps)){

          ipCookie("google_connect_prompt", true, { expires: 3 });

          $scope.hasGoogleApps = false;
          $scope.needsGoogleAuth = true;

          var title = 'Google Email Verification request',
              message = 'In order to access your company\'s calendar, we need to \
                         verify your email belonging to the organization (' + integrationStatus.google_apps.domain + '). \
                         Once you click OK below, you will be sent to Google\'s authentication servers, \
                         and then will be redirected back here once the verification process has completed.',
              callback = function(){
                location.href = '/auth/google/prep?referrer=' + encodeURIComponent($rootScope.homePath + '#/interviews/schedule');
              };

          // Modal.alert(title, message, callback);
          alert(message);
          callback();
        }
        else if(integrationStatus && usingGoogleApps(integrationStatus.google_apps)){
          $scope.hasGoogleApps = true;
        }
      });

      var createNew = function(term){
        var data = { results: [] };

        if(!term.length)
          return $scope.interviewersCache;

        var regex = new RegExp(term, 'i');

        data.results = _.filter($scope.interviewersCache.results, function(item){
          return regex.test(item.text) || regex.test(item.email);
        });

        if(!data.results.length){
          var email = term,
              split = email.split('@'),
              domain = $scope.primaryDomain();

          if(split.length == 1 || domain.slice(0, split[1].length) == split[1])
              email = split[0] + '@' + domain;

          data.results = [{
            id: 0,
            text: term,
            email: email.replace(/\s+/g, '')
          }];
        }

        return data;
      };

      // angular.extend($scope, {
      //   interviewersCache: [],
      //   interviewersSelectSetup: {
      //     allowClear: true,
      //     minimumInputLength: 0,
      //     placeholder: "Select interviewer...",
      //     selectOnBlur: true,
      //     formatResult: function(data){
      //       return '<div class="name-results">' + data.text + '<div><div class="email grey"><small>' + data.email + '</small></div>';
      //     },
      //     query: function(query){
      //       var matches = _.any($scope.interviewersCache.results, function(interviewer){
      //         return interviewer.text.toLowerCase() == query.term;
      //       });

      //       if(!matches){
      //         query.callback(createNew(query.term));
      //       }
      //     },
      //     data: function(){
      //       return $scope.interviewersCache;
      //     },
      //     initSelection: function(element, callback){
      //       callback(parseSearch($(element).data('$ngModelController').$modelValue));
      //     }
      //   }
      // });

      /*-------------------------------------
        Watchers
       -------------------------------------*/

      $scope.$on('sidebar:toggleQuickSchedule', function(){
        $scope.toggleQuickSchedule();
      });

      $scope.$on('sidebar:locationChangeStart', function(){
        $scope.sanitize();
      });

      $scope.$watch('newPanel.job_role', function(n){
        if(n && n.id){
          $scope.newPanel.job_role_id = n.id;
        }
      });

      $scope.$watch('newPanel.starts_at', function(n, o){
        if($.type(n) == 'string'){
          $scope.newPanel.starts_at = new Date(n);

          if(!$scope.time){
            var mins = $scope.newPanel.starts_at.getMinutes(),
                hours = $scope.newPanel.starts_at.getHours();

            if(mins < 10)
              mins = '0' + mins;

            if(hours < 10)
              hours = '0' + hours;

            $scope.time = '' + hours + mins;
          }
        }else{
          setTime($scope.newPanel.starts_at, $scope.time);
        }

        if($scope.duration){
          $scope.newPanel.ends_at = setDuration($scope.newPanel.starts_at, $scope.duration);
        }else{
          if($.type($scope.newPanel.ends_at) == 'string')
            $scope.newPanel.ends_at = new Date($scope.newPanel.ends_at);

          if($.type($scope.newPanel.ends_at) == 'date')
            $scope.duration = ''+ (($scope.newPanel.ends_at.getTime() - $scope.newPanel.starts_at.getTime()) / 60000);
        }
      });

      $scope.$watch('newPanel.quick_time', function(n){
        $scope.time = n;
        setTime($scope.newPanel.starts_at, n);
        $scope.newPanel.ends_at = setDuration($scope.newPanel.starts_at, $scope.duration);
      });

      $scope.$watch('newPanel.quickDuration', function(n){
        $scope.duration = n;
        $scope.newPanel.ends_at = setDuration($scope.newPanel.starts_at, n);
      });

      $scope.$watch('showQuickScheduling', function(n){
        if(n){
          $('#quick-scheduler').effect('subtleFadeIn', { duration: 400 });
          $scope.loaded = true;
        }
        else if($scope.loaded){
          $('#quick-scheduler').effect('subtleFadeOut', { duration: 400 }, function(){
            $(this).css('visibility', 'hidden');
          });
        }
      });
    }
  ]);
